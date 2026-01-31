import { writeFileSync } from 'fs';
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
  const metadata: MessageMetadata = {
    date: message.date.toISOString(),
    messageId: message.messageId,
  };

  const content = message.text || '';
  const markdown = matter.stringify(content, metadata);

  const filename = `${message.messageId}.md`;
  const filepath = join(dir, filename);

  writeFileSync(filepath, markdown, 'utf-8');

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

    await downloadMedia(telegramBotToken, file.fileId, basePath);
  }
}
