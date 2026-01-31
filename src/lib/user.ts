import { loadConfig } from './config.js';
import { getProfile } from './profiles.js';

export function getEffectiveTelegramUserId(dir: string = process.cwd()): number {
  const config = loadConfig(dir);
  const profile = getProfile(config.profile);

  const telegramUserId = config.telegramUserId ?? profile.telegramUserId;

  if (!telegramUserId) {
    throw new Error(
      `No Telegram user ID configured. Profile "${config.profile}" is missing telegramUserId field.`
    );
  }

  return telegramUserId;
}
