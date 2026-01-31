# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CLI tool to fetch latest messages sent to a Telegram bot, channel, or group to a local directory. Only fetches messages from a specific user (you).

**Key Features:**
- Interactive CLI with Commander.js + @inquirer/prompts
- Global profile management for bot tokens
- Per-directory configuration with incremental fetching
- Filters messages by user ID (only your messages)
- Outputs as markdown with YAML front matter
- Downloads media: images and audio/voice messages

## Development Commands

```bash
# Build TypeScript
npm run build

# Run without building (development)
npm run dev

# Format code
npm run format

# Install globally for testing
npm link

# Use globally
telegram-fetch --help
telegram-fetch profile add
telegram-fetch init
```

## Project Structure

```
src/
├── cli.ts              # Main entry point with Commander setup
├── commands/
│   ├── init.ts         # Interactive init command
│   └── profile.ts      # Profile management (add/list/remove)
├── lib/
│   ├── config.ts       # Local config file management
│   ├── profiles.ts     # Global profile management
│   └── user.ts         # User ID resolution (local override or profile default)
└── types.ts            # TypeScript type definitions

dist/                   # Compiled JavaScript output
```

## Configuration Files

**Global profiles** (`~/.telegram-fetcher/profiles.json`):
- Bot tokens and user IDs
- Reusable across multiple directories

**Local config** (`telegram-fetcher.config.json`):
- References a profile by name
- Optional userId override for this directory

**Local state** (`.last-fetched-id`):
- Tracks last fetched message ID
- Updated on every fetch

## Implementation Status

### Phase 1: CLI Framework ✅ COMPLETE
- ✅ TypeScript project structure
- ✅ Profile management (add, list, remove)
- ✅ Interactive init command
- ✅ User ID requirement (global + local override)
- ✅ Config and state file management

### Phase 2: Telegram Integration (NEXT)
- Add Telegraf dependency
- Implement message fetching
- Filter by user ID
- Download media (images, audio)
- Save as markdown with front matter

## Important Notes

- User ID is required (set in profile, can be overridden locally)
- Only messages from the specified user ID will be fetched
- Bot must be added to channels/groups to access messages
- Uses Bot API only (not user authentication)

## Finding Your Telegram User ID

Send a message to [@userinfobot](https://t.me/userinfobot) on Telegram to get your user ID.
