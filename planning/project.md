# Telegram Fetcher - Project Plan

## Overview

A CLI tool to fetch latest messages from Telegram (bots, channels, groups, saved messages) and save them to a local directory.

## Core Functionality

### Message Fetching
- Fetch messages from Telegram bots (primary use case)
- Fetch messages from Telegram channels (only via bot access - bot must be member)
- Fetch messages from Telegram groups (only via bot access - bot must be member)

**Scope limitation**: Using Bot API only (not user account). This means:
- Authentication via bot token
- No access to saved messages (user personal storage)
- Bot must be added to channels/groups to fetch messages

### Content Types (All Supported ✅)
- **Text content**: Message text and captions
- **Photos**: Photo attachments
- **Audio**: Audio files
- **Voice**: Voice messages (**CRITICAL REQUIREMENT** ✅)
- **Documents**: PDFs, DOCs, text files, etc.
- **Videos**: Video files
- **Animations**: GIFs
- **Stickers**: Telegram stickers
- **Video notes**: Circular video messages

### Incremental Fetching
- Store the latest fetched message ID in a local config file
- On subsequent runs, only fetch new messages since the last run
- Config file lives in the target directory where messages are saved

### CLI Design
- Installable globally (npm install -g or equivalent)
- Can be run from any directory
- Detects and reads config from current working directory
- Initializes new projects with a config file

## Key Design Decisions

### 1. Bot Token Storage - DECIDED

**Approach: Profile-based system**
- Store bot profiles centrally in `~/.telegram-fetcher/profiles.json` (or similar)
- Each profile contains: bot token, bot name/description
- Local config file in project directory references profile by name
- Supports multiple bots globally, but each directory uses one specific profile

**Benefits:**
- Bot tokens never in project directory (no git commit risk)
- Easy to reuse bots across multiple projects
- Simple local config (just references profile name)
- Can manage multiple bots centrally

**Example:**
- Global: `~/.telegram-fetcher/profiles.json` contains bot tokens
- Local: `./telegram-fetcher.config.json` contains `{"profile": "my-bot-name", "lastMessageId": 123}`

### 2. Configuration File Structure - DECIDED

**Local config file** (in project directory - `telegram-fetcher.config.json`):
```json
{
  "profile": "bot-profile-name",
  "telegramUserId": 987654321  // Optional: Override telegramUserId from profile
}
```

**Global profiles file** (`~/.telegram-fetcher/profiles.json`):
```json
{
  "bot-profile-name": {
    "telegramBotToken": "123456:ABC-DEF...",
    "telegramUserId": 123456789,
    "botDescription": "My content bot"
  }
}
```

**Telegram User ID behavior:**
- Required in global profile (error if not set)
- Can be overridden in local config (optional)
- When fetching: use local telegramUserId if set, otherwise use profile telegramUserId
- Only messages from this user ID will be fetched

**No state tracking:**
- Telegram Bot API automatically confirms updates when fetched via `getUpdates`
- Each run of `telegram-fetch` fetches all unconsumed updates
- No need to track last fetched message/update ID

### 3. Output Format - DECIDED

**Message format**: Markdown files with YAML front matter
```markdown
---
date: 2026-01-31T10:30:00Z
messageId: 12345
---

Message text content here...
```

**File organization**:
- Flat directory structure (all files in same directory)
- One markdown file per message: `{messageId}.md`
- Media files: `{messageId}.{ext}` (e.g., `12345.jpg`, `12345.ogg`)
- Multiple media in same message: `{messageId}_1.jpg`, `{messageId}_2.jpg`, etc.

**Media files**:
- **Audio messages**: `.ogg` (Telegram voice message format)
- **Images**: `.jpg`, `.png`, etc. (preserve original format)
- Stored alongside markdown files in same directory

### 4. Telegram API Integration
- **Library choice: Telegraf** (modern, TypeScript-native, excellent documentation)
  - ✅ Supports audio message/voice message downloads via `getFileLink()`
  - ✅ Handles images and media files
  - ✅ Written in TypeScript with full type definitions
- **Authentication**: Bot token only (from @BotFather)
- Rate limiting and error handling
- Media download and storage capabilities

### 5. CLI Framework & Interactive Prompts
- **CLI Framework: Commander.js** (argument parsing, command structure)
- **Interactive Prompts: @inquirer/prompts** (modern, TypeScript-friendly)
- **Interactive commands**: `init`, `profile add`, `profile remove`
- **Non-interactive**: Main fetch command

## CLI Commands & Interactive Flows

### `telegram-fetch init` (Interactive)
1. Check if `telegram-fetcher.config.json` exists in current directory
2. If exists: Prompt "Config already exists. Reconfigure? (y/N)"
3. Show profile selection prompt:
   - List all existing profiles from `~/.telegram-fetcher/profiles.json`
   - Option: "[Add new profile]"
4. If "[Add new profile]" selected:
   - Prompt: "Profile name:"
   - Prompt: "Bot token:" (masked input)
   - Prompt: "Your Telegram user ID:"
   - Prompt: "Description (optional):"
   - Save to global profiles.json
5. Ask: "Override user ID for this directory? (y/N)"
   - If yes: Prompt for userId, save in local config
   - If no: Use profile's userId
6. Create local config with selected profile + optional userId override

### `telegram-fetch` (Main command - Non-interactive)
1. Check if local config exists, error if not
2. Load profile from global profiles.json
3. Get effective Telegram user ID (local override or profile default)
4. Connect to Telegram with bot token
5. Fetch all unconsumed updates (automatically confirmed by API)
6. Filter messages by telegramUserId
7. Download text + media (audio, images)
8. Save as markdown files with front matter

### `telegram-fetch profile add` (Interactive)
- Prompt: "Profile name:"
- Prompt: "Bot token:" (masked input)
- Prompt: "Your Telegram user ID:" (required)
  - Hint: Use `telegram-fetch get-user-id` or @userinfobot to find it
- Prompt: "Description (optional):"
- Save to `~/.telegram-fetcher/profiles.json`

### `telegram-fetch get-user-id` (Helper command)
- Connects to a bot using existing profile
- Prompts: "Select a profile to use:"
- Instructions: "Send any message to the bot"
- Listens for incoming message
- Displays: "Your Telegram user ID is: 123456789"
- Can copy this ID when adding profiles

### `telegram-fetch profile list` (Non-interactive)
- List all profiles from global config
- Show: name, description (token masked)

### `telegram-fetch profile remove` (Interactive)
- Show list of profiles
- Prompt: "Select profile to remove:"
- Confirm: "Delete profile '{name}'? (y/N)"
- Remove from global config

### `telegram-fetch --help` or `telegram-fetch -h`
Display help information (provided automatically by Commander.js):
```
Usage: telegram-fetch [options] [command]

CLI tool to fetch latest messages from Telegram bots, channels, and groups

Options:
  -V, --version          output the version number
  -h, --help             display help for command

Commands:
  init                   Initialize telegram-fetcher in current directory
  profile                Manage bot profiles
    add                  Add a new bot profile
    list                 List all bot profiles
    remove               Remove a bot profile
  help [command]         display help for command
```

## Project Structure

```
telegram-fetcher/
├── src/
│   ├── cli.ts          # Main entry point, Commander setup
│   ├── commands/
│   │   ├── init.ts     # Interactive init command
│   │   ├── fetch.ts    # Main fetch logic
│   │   └── profile.ts  # Profile management commands
│   ├── lib/
│   │   ├── config.ts   # Config file read/write
│   │   ├── profiles.ts # Profile management
│   │   ├── telegram.ts # Telegram API wrapper
│   │   └── storage.ts  # Message/media storage
│   └── types.ts        # TypeScript types
├── dist/               # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Implementation Phases

### Phase 1: Bootstrap CLI Framework ✅ COMPLETE
**Goal:** Get the CLI working so you can run `telegram-fetch init` and start testing with real bot tokens.

**Completed Tasks:**
1. ✅ Set up TypeScript project structure
   - Initialize npm project
   - Configure TypeScript (tsconfig.json matching audio-note-transcripts)
   - Set up build scripts (`build`, `dev`)
   - Configure prettier

2. ✅ Install dependencies
   - `commander` - CLI framework
   - `@inquirer/prompts` - Interactive prompts
   - `@types/node` - TypeScript types
   - `tsx` - Development runtime
   - `prettier` - Code formatting

3. ✅ Create basic CLI structure
   - `src/cli.ts` - Main entry point with Commander setup
   - `src/commands/init.ts` - Init command
   - `src/commands/profile.ts` - Profile commands
   - `src/lib/config.ts` - Config file utilities
   - `src/lib/profiles.ts` - Profile management utilities
   - `src/lib/user.ts` - User ID resolution
   - `src/types.ts` - TypeScript type definitions

4. ✅ Implement profile management
   - Global profiles.json read/write
   - `telegram-fetch profile add` - Interactive add with masked token input
   - `telegram-fetch profile list` - List all profiles
   - `telegram-fetch profile remove` - Interactive removal
   - Profile validation (name, token format)
   - Telegram user ID requirement (global + local override)

5. ✅ Implement init command
   - `telegram-fetch init` - Interactive profile selection
   - Create local `telegram-fetcher.config.json`
   - Create empty `.last-fetched-id` file
   - Handle existing config (ask to overwrite)
   - Option to add new profile inline
   - Optional local Telegram user ID override

6. ✅ Make globally installable
   - Configure `bin` in package.json
   - Test with `npm link`
   - Verify all commands work globally

7. ✅ Verbose variable naming
   - `telegramBotToken`, `telegramUserId`, `botDescription`
   - Clean, less verbose code comments

**Deliverable:** ✅ Working CLI that can manage profiles and initialize directories. Ready to add Telegram fetching logic.

**Usage:**
```bash
npm link
telegram-fetch profile add
telegram-fetch init
ls -la  # Should see telegram-fetcher.config.json and .last-fetched-id
```

### Phase 2: Core Telegram Fetching ✅ COMPLETE
**Goal:** Connect to Telegram and fetch messages (text only, no media yet).

**Completed Tasks:**
1. ✅ Install Telegraf dependency (types only)
2. ✅ Install gray-matter for front matter handling
3. ✅ Implement `src/lib/telegram.ts` - Direct Telegram API calls
4. ✅ Implement `src/lib/storage.ts` - Message storage with front matter
5. ✅ Implement `src/commands/fetch.ts` - Main fetch command
6. ✅ Filter messages by telegramUserId
7. ✅ Restore `.last-fetched-id` tracking (updates not auto-confirmed)
8. ✅ Fix offset bug by using direct API instead of Telegraf wrapper
9. ✅ Add messageId to front matter
10. ✅ Test with real bot - working correctly

**How it works:**
- Calls Telegram Bot API directly via `fetch()` to get updates
- Uses offset = lastUpdateId + 1 for pagination
- Filters messages by telegramUserId
- Saves messages as markdown with YAML front matter (date, messageId)
- Tracks last update ID in `.last-fetched-id` file

### Phase 3: Media Downloads ✅ COMPLETE
**Goal:** Download and save all media attachments.

**Completed Tasks:**
1. ✅ Detect all media types (photos, audio, voice, documents, videos, animations, stickers, video notes)
2. ✅ Download media via Telegram API (getFile + file download)
3. ✅ Extract real file extensions from API response
4. ✅ Support captions for photos and media (not just text messages)
5. ✅ Handle multiple attachments per message (numbered suffixes)
6. ✅ Preserve original filenames when available
7. ✅ Test with various media types

**How it works:**
- Detects all attachment types in messages
- Collects file_id and fileName (if available) for each attachment
- Downloads each file via `getFile` API to get file_path
- Extracts extension from file_path
- Saves files with naming pattern:
  - With filename: `{messageId}_{filename}.ext` (e.g., `20_document.docx`)
  - Without filename: `{messageId}_{index}.ext` (e.g., `20_1.jpg`, `20_2.oga`)
- Supports: photos, audio, voice, documents, videos, animations, stickers, video notes

### Phase 4: Polish & Documentation 🎯 NEXT
**Goal:** Production-ready tool with documentation.

**Tasks:**
1. Error handling improvements
2. Rate limiting handling (if needed)
3. Write comprehensive README
4. Update CLAUDE.md with final architecture
5. Remove debug output (punycode deprecation warning)
6. Final testing
7. Consider publishing to npm (optional)

## Build & Development Commands

Following the pattern from audio-note-transcripts:

```bash
# Development (run without building)
npm run dev

# Build TypeScript to dist/
npm run build

# Format code with prettier
npm run format

# Install globally for testing
npm link

# Use globally
telegram-fetch init
telegram-fetch
```

**package.json structure:**
```json
{
  "name": "telegram-fetcher",
  "bin": {
    "telegram-fetch": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/cli.ts",
    "format": "prettier --write ."
  },
  "dependencies": {
    "commander": "^14.0.2",
    "@inquirer/prompts": "^latest",
    "telegraf": "^latest"
  },
  "devDependencies": {
    "@types/node": "^latest",
    "prettier": "^latest",
    "tsx": "^latest",
    "typescript": "^latest"
  }
}
```

## Decisions Made

1. ✅ **Technology**: TypeScript/Node.js with Telegraf library
2. ✅ **CLI Framework**: Commander.js + @inquirer/prompts for interactive flows
3. ✅ **Scope**: Bot API only (no user accounts, no saved messages)
4. ✅ **Multiple bots**: Support multiple bots via central profile system, one profile per directory
5. ✅ **Filtering**: No filtering by date, sender, or keywords
6. ✅ **Deleted messages**: No special handling - just fetch from last message ID onward
7. ✅ **Dry run mode**: Not needed
8. ✅ **First run behavior**: Fetch all available message history
9. ✅ **User Experience**: Interactive prompts for setup, simple command for fetching

## All Questions Resolved

✅ All design decisions have been made. Ready to begin implementation.

**Summary of output structure:**
```
project-directory/
├── telegram-fetcher.config.json  # Static config (profile name, optional userId override)
├── .last-fetched-id              # Last update ID (tracks fetch state)
├── 12345.md                      # Message text with front matter (date, messageId)
├── 12345.oga                     # Voice message (extension from API)
├── 12346.md                      # Message with photo + caption
├── 12346.jpg                     # Photo from message 12346
├── 12347.md                      # Message with multiple attachments
├── 12347_1.jpg                   # First attachment
├── 12347_report.pdf              # Second attachment (original filename preserved)
└── 12348.md                      # Text-only message
```

**Recommended .gitignore:**
```
*.md
*.jpg
*.png
*.ogg
*.mp3
!README.md
!CLAUDE.md
```
