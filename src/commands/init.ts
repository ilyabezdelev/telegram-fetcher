import { select, confirm, input, password } from '@inquirer/prompts';
import { configExists, saveConfig, saveLastFetchedId } from '../lib/config.js';
import { listProfileNames, addProfile, loadProfiles } from '../lib/profiles.js';
import type { LocalConfig } from '../types.js';

export async function init(): Promise<void> {
  try {
    if (configExists()) {
      const overwrite = await confirm({
        message: 'Config already exists. Reconfigure?',
        default: false,
      });

      if (!overwrite) {
        console.log();
        console.log('Cancelled.');
        console.log();
        return;
      }
    }

    const existingProfiles = listProfileNames();
    const choices: Array<{ name: string; value: string }> = [];

    if (existingProfiles.length > 0) {
      const profiles = loadProfiles();
      for (const name of existingProfiles) {
        const desc = profiles[name].botDescription ? ` - ${profiles[name].botDescription}` : '';
        choices.push({
          name: `${name}${desc}`,
          value: name,
        });
      }
    }

    choices.push({
      name: '[Add new profile]',
      value: '__ADD_NEW__',
    });

    let selectedProfile = await select({
      message: 'Select a profile for this directory:',
      choices,
    });

    if (selectedProfile === '__ADD_NEW__') {
      console.log();
      console.log('Add new profile:');
      console.log();

      const name = await input({
        message: 'Profile name:',
        validate: (value) => {
          if (!value.trim()) {
            return 'Profile name is required';
          }
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
            return 'Profile name can only contain letters, numbers, hyphens, and underscores';
          }
          if (existingProfiles.includes(value)) {
            return `Profile "${value}" already exists`;
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

      selectedProfile = name;
      console.log();
      console.log(`✓ Profile "${name}" created!`);
    }

    console.log();
    const overrideTelegramUserId = await confirm({
      message: 'Override user ID for this directory?',
      default: false,
    });

    let localTelegramUserId: number | undefined;
    if (overrideTelegramUserId) {
      const telegramUserIdStr = await input({
        message: 'User ID for this directory:',
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
      localTelegramUserId = parseInt(telegramUserIdStr, 10);
    }

    const config: LocalConfig = { profile: selectedProfile };
    if (localTelegramUserId !== undefined) {
      config.telegramUserId = localTelegramUserId;
    }
    saveConfig(config);

    saveLastFetchedId(0);

    console.log();
    console.log('✓ Initialized telegram-fetcher in current directory!');
    console.log();
    console.log(`Profile: ${selectedProfile}`);
    if (localTelegramUserId !== undefined) {
      console.log(`User ID: ${localTelegramUserId} (local override)`);
    }
    console.log(`Config: telegram-fetcher.config.json`);
    console.log(`State: .last-fetched-id`);
    console.log();
    console.log('Run "telegram-fetch" to start fetching messages.');
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
