export interface BotProfile {
  telegramBotToken: string;
  telegramUserId: number;
  botDescription?: string;
}

export interface Profiles {
  [name: string]: BotProfile;
}

export interface LocalConfig {
  profile: string;
  telegramUserId?: number;
}
