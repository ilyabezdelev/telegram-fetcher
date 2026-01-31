import { loadConfig } from './config.js';
import { getProfile } from './profiles.js';

export function getEffectiveTelegramUserId(dir: string = process.cwd()): number {
  const config = loadConfig(dir);
  const profile = getProfile(config.profile);

  const telegramUserId = config.telegramUserId ?? profile.telegramUserId;

  if (!telegramUserId) {
    throw new Error(
      `Telegram user ID is required but not configured in profile "${config.profile}". ` +
        `Please run "telegram-fetch profile add" to create a new profile with a user ID.`
    );
  }

  return telegramUserId;
}
