import type { Update } from 'telegraf/types';

export interface MediaFile {
  fileId: string;
  fileSize?: number;
  fileName?: string;
}

export interface FetchedMessage {
  messageId: number;
  text: string | undefined;
  date: Date;
  updateId: number;
  files: MediaFile[];
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

    const files: MediaFile[] = [];

    if ('photo' in message && message.photo) {
      const largestPhoto = message.photo[message.photo.length - 1];
      files.push({
        fileId: largestPhoto.file_id,
        fileSize: largestPhoto.file_size,
      });
    }

    if ('audio' in message && message.audio) {
      files.push({
        fileId: message.audio.file_id,
        fileSize: message.audio.file_size,
        fileName: message.audio.file_name,
      });
    }

    if ('voice' in message && message.voice) {
      files.push({
        fileId: message.voice.file_id,
        fileSize: message.voice.file_size,
      });
    }

    if ('document' in message && message.document) {
      files.push({
        fileId: message.document.file_id,
        fileSize: message.document.file_size,
        fileName: message.document.file_name,
      });
    }

    if ('video' in message && message.video) {
      files.push({
        fileId: message.video.file_id,
        fileSize: message.video.file_size,
        fileName: message.video.file_name,
      });
    }

    if ('video_note' in message && message.video_note) {
      files.push({
        fileId: message.video_note.file_id,
        fileSize: message.video_note.file_size,
      });
    }

    if ('animation' in message && message.animation) {
      files.push({
        fileId: message.animation.file_id,
        fileSize: message.animation.file_size,
        fileName: message.animation.file_name,
      });
    }

    if ('sticker' in message && message.sticker) {
      files.push({
        fileId: message.sticker.file_id,
        fileSize: message.sticker.file_size,
      });
    }

    const text =
      'text' in message ? message.text : 'caption' in message ? message.caption : undefined;

    messages.push({
      messageId: message.message_id,
      text,
      date: new Date(message.date * 1000),
      updateId: update.update_id,
      files,
    });
  }

  return messages;
}

export async function downloadMedia(
  telegramBotToken: string,
  fileId: string,
  destinationPath: string
): Promise<string> {
  const getFileUrl = `https://api.telegram.org/bot${telegramBotToken}/getFile?file_id=${fileId}`;
  const getFileResponse = await fetch(getFileUrl);
  const getFileData = (await getFileResponse.json()) as {
    ok: boolean;
    result: { file_path: string };
    description?: string;
  };

  if (!getFileData.ok) {
    throw new Error(`Failed to get file: ${getFileData.description || 'Unknown error'}`);
  }

  const filePath = getFileData.result.file_path;
  const downloadUrl = `https://api.telegram.org/file/bot${telegramBotToken}/${filePath}`;

  const downloadResponse = await fetch(downloadUrl);
  if (!downloadResponse.ok) {
    throw new Error(`Failed to download file: ${downloadResponse.statusText}`);
  }

  const arrayBuffer = await downloadResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fs = await import('fs');
  const path = await import('path');

  const ext = path.extname(filePath);
  const finalPath = destinationPath + ext;

  fs.writeFileSync(finalPath, buffer);

  return finalPath;
}

function isMessageUpdate(update: Update): update is Update.MessageUpdate {
  return 'message' in update;
}
