import type { Update } from 'telegraf/types';

export interface FetchedMessage {
  messageId: number;
  text: string | undefined;
  date: Date;
  updateId: number;
}

export interface FetchMessagesOptions {
  telegramBotToken: string;
  telegramUserId: number;
  lastUpdateId?: number;
}

export async function fetchMessages(options: FetchMessagesOptions): Promise<FetchedMessage[]> {
  const { telegramBotToken, telegramUserId, lastUpdateId = 0 } = options;
  const messages: FetchedMessage[] = [];

  const offset = lastUpdateId + 1;
  const url = `https://api.telegram.org/bot${telegramBotToken}/getUpdates?offset=${offset}&limit=100`;
  const response = await fetch(url);
  const data = (await response.json()) as {
    ok: boolean;
    result: Update[];
    description?: string;
  };

  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
  }

  const updates: Update[] = data.result;

  for (const update of updates) {
    if (!isMessageUpdate(update)) {
      continue;
    }

    const message = update.message;

    if (message.from?.id !== telegramUserId) {
      continue;
    }

    messages.push({
      messageId: message.message_id,
      text: 'text' in message ? message.text : undefined,
      date: new Date(message.date * 1000),
      updateId: update.update_id,
    });
  }

  return messages;
}

function isMessageUpdate(update: Update): update is Update.MessageUpdate {
  return 'message' in update;
}
