import { writeFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import type { FetchedMessage } from './telegram.js';

export interface MessageMetadata {
  date: string;
  messageId: number;
}

export function saveMessage(message: FetchedMessage, dir: string = process.cwd()): void {
  const metadata: MessageMetadata = {
    date: message.date.toISOString(),
    messageId: message.messageId,
  };

  const content = message.text || '';
  const markdown = matter.stringify(content, metadata);

  const filename = `${message.messageId}.md`;
  const filepath = join(dir, filename);

  writeFileSync(filepath, markdown, 'utf-8');
}
