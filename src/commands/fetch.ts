import { loadConfig, loadLastFetchedId, saveLastFetchedId } from '../lib/config.js';
import { getProfile } from '../lib/profiles.js';
import { getEffectiveTelegramUserId } from '../lib/user.js';
import { fetchMessages } from '../lib/telegram.js';
import { saveMessage } from '../lib/storage.js';

export async function fetch(): Promise<void> {
  const config = loadConfig();
  const profile = getProfile(config.profile);
  const telegramUserId = getEffectiveTelegramUserId();
  const lastUpdateId = loadLastFetchedId();

  console.log();
  console.log('Fetching messages...');
  console.log();

  const messages = await fetchMessages({
    telegramBotToken: profile.telegramBotToken,
    telegramUserId,
    lastUpdateId,
  });

  if (messages.length === 0) {
    console.log('No new messages found.');
    console.log();
    return;
  }

  console.log(`Found ${messages.length} message(s)`);
  console.log();

  let latestUpdateId = lastUpdateId;

  for (const message of messages) {
    await saveMessage(message, profile.telegramBotToken);
    console.log(`✓ Saved message ${message.messageId}`);

    if (message.updateId > latestUpdateId) {
      latestUpdateId = message.updateId;
    }
  }

  saveLastFetchedId(latestUpdateId);

  console.log();
  console.log(`✓ Fetched ${messages.length} message(s) successfully!`);
  console.log();
}
