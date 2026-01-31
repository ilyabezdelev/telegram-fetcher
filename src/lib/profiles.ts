import { homedir } from 'os';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Profiles, BotProfile } from '../types.js';

const PROFILES_DIR = join(homedir(), '.telegram-fetcher');
const PROFILES_FILE = join(PROFILES_DIR, 'profiles.json');

export function ensureProfilesDir(): void {
  if (!existsSync(PROFILES_DIR)) {
    mkdirSync(PROFILES_DIR, { recursive: true });
  }
}

export function loadProfiles(): Profiles {
  ensureProfilesDir();

  if (!existsSync(PROFILES_FILE)) {
    return {};
  }

  try {
    const content = readFileSync(PROFILES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to load profiles: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function saveProfiles(profiles: Profiles): void {
  ensureProfilesDir();

  try {
    writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to save profiles: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function addProfile(name: string, profile: BotProfile): void {
  const profiles = loadProfiles();

  if (profiles[name]) {
    throw new Error(`Profile "${name}" already exists`);
  }

  profiles[name] = profile;
  saveProfiles(profiles);
}

export function removeProfile(name: string): void {
  const profiles = loadProfiles();

  if (!profiles[name]) {
    throw new Error(`Profile "${name}" not found`);
  }

  delete profiles[name];
  saveProfiles(profiles);
}

export function getProfile(name: string): BotProfile {
  const profiles = loadProfiles();

  if (!profiles[name]) {
    throw new Error(`Profile "${name}" not found`);
  }

  return profiles[name];
}

export function listProfileNames(): string[] {
  const profiles = loadProfiles();
  return Object.keys(profiles);
}
