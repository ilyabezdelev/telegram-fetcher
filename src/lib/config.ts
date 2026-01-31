import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { LocalConfig } from '../types.js';

const CONFIG_FILE = 'telegram-fetcher.config.json';
const STATE_FILE = '.last-fetched-id';

export function configExists(dir: string = process.cwd()): boolean {
  return existsSync(join(dir, CONFIG_FILE));
}

export function loadConfig(dir: string = process.cwd()): LocalConfig {
  const configPath = join(dir, CONFIG_FILE);

  if (!existsSync(configPath)) {
    throw new Error('Config file not found. Run "telegram-fetch init" first.');
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to load config: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function saveConfig(config: LocalConfig, dir: string = process.cwd()): void {
  const configPath = join(dir, CONFIG_FILE);

  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to save config: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function loadLastFetchedId(dir: string = process.cwd()): number {
  const statePath = join(dir, STATE_FILE);

  if (!existsSync(statePath)) {
    return 0;
  }

  try {
    const content = readFileSync(statePath, 'utf-8').trim();
    const id = parseInt(content, 10);
    return isNaN(id) ? 0 : id;
  } catch (error) {
    return 0;
  }
}

export function saveLastFetchedId(id: number, dir: string = process.cwd()): void {
  const statePath = join(dir, STATE_FILE);

  try {
    writeFileSync(statePath, id.toString(), 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to save last fetched ID: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
