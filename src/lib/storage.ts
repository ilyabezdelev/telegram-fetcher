import { utimesSync, writeFileSync } from 'fs';
import { join, parse } from 'path';
import matter from 'gray-matter';
import type { FetchedMessage } from './telegram.js';
import { downloadMedia } from './telegram.js';

export interface MessageMetadata {
  date: string;
  messageId: number;
}

export async function saveMessage(
  message: FetchedMessage,
  telegramBotToken: string,
  dir: string = process.cwd()
): Promise<void> {
  const hasTextContent = message.text && message.text.trim().length > 0;

  if (hasTextContent) {
    const metadata: MessageMetadata = {
      date: message.date.toISOString(),
      messageId: message.messageId,
    };

    const markdown = matter.stringify(message.text!, metadata);

    const filename = `${message.messageId}.md`;
    const filepath = join(dir, filename);

    writeFileSync(filepath, markdown, 'utf-8');
    utimesSync(filepath, message.date, message.date);
  }

  let fileIndex = 0;

  for (const file of message.files) {
    fileIndex++;

    let basePath: string;
    if (file.fileName) {
      const parsed = parse(file.fileName);
      basePath = join(dir, `${message.messageId}_${parsed.name}`);
    } else {
      const suffix = fileIndex === 1 ? '' : `_${fileIndex}`;
      basePath = join(dir, `${message.messageId}${suffix}`);
    }

    const savedPath = await downloadMedia(telegramBotToken, file.fileId, basePath);
    utimesSync(savedPath, message.date, message.date);
  }
}
