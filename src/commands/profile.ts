import { input, password, select, confirm } from '@inquirer/prompts';
import { addProfile, removeProfile, loadProfiles, listProfileNames } from '../lib/profiles.js';

export async function profileAdd(): Promise<void> {
  try {
    const name = await input({
      message: 'Profile name:',
      validate: (value) => {
        if (!value.trim()) {
          return 'Profile name is required';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return 'Profile name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      },
    });

    const telegramBotToken = await password({
      message: 'Bot token:',
      mask: '*',
      validate: (value) => {
        if (!value.trim()) {
          return 'Bot token is required';
        }
        if (!/^\d+:[A-Za-z0-9_-]+$/.test(value)) {
          return 'Invalid bot token format. Expected format: 123456:ABC-DEF...';
        }
        return true;
      },
    });

    const telegramUserIdStr = await input({
      message: 'Your Telegram user ID:',
      validate: (value) => {
        if (!value.trim()) {
          return 'User ID is required';
        }
        const telegramUserId = parseInt(value, 10);
        if (isNaN(telegramUserId) || telegramUserId <= 0) {
          return 'User ID must be a positive number';
        }
        return true;
      },
    });

    const telegramUserId = parseInt(telegramUserIdStr, 10);

    const botDescription = await input({
      message: 'Description (optional):',
    });

    addProfile(name, {
      telegramBotToken,
      telegramUserId,
      botDescription: botDescription || undefined,
    });

    console.log();
    console.log(`✓ Profile "${name}" added successfully!`);
    console.log();
  } catch (error) {
    if ((error as { name?: string }).name === 'ExitPromptError') {
      console.log();
      console.log('Cancelled.');
      process.exit(0);
    }
    throw error;
  }
}

export async function profileList(): Promise<void> {
  const profiles = loadProfiles();
  const names = Object.keys(profiles);

  if (names.length === 0) {
    console.log();
    console.log('No profiles found.');
    console.log('Add a profile with: telegram-fetch profile add');
    console.log();
    return;
  }

  console.log();
  console.log('Available profiles:');
  console.log();

  for (const name of names) {
    const profile = profiles[name];
    const tokenPreview = `${profile.telegramBotToken.substring(0, 10)}...`;
    const desc = profile.botDescription ? ` - ${profile.botDescription}` : '';
    console.log(`  ${name} (User ID: ${profile.telegramUserId}, Token: ${tokenPreview})${desc}`);
  }

  console.log();
}

export async function profileRemove(): Promise<void> {
  try {
    const names = listProfileNames();

    if (names.length === 0) {
      console.log();
      console.log('No profiles found.');
      console.log();
      return;
    }

    const name = await select({
      message: 'Select profile to remove:',
      choices: names.map((n) => ({ name: n, value: n })),
    });

    const confirmed = await confirm({
      message: `Delete profile "${name}"?`,
      default: false,
    });

    if (!confirmed) {
      console.log();
      console.log('Cancelled.');
      console.log();
      return;
    }

    removeProfile(name);

    console.log();
    console.log(`✓ Profile "${name}" removed successfully!`);
    console.log();
  } catch (error) {
    if ((error as { name?: string }).name === 'ExitPromptError') {
      console.log();
      console.log('Cancelled.');
      process.exit(0);
    }
    throw error;
  }
}
