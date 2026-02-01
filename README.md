# telegram-fetcher

Save your Telegram messages and attachments to a local directory as markdown files.

## What it does

Send messages to a Telegram bot, run `telegram-fetch`, and your messages are saved as markdown files with all attachments downloaded automatically.

## Installation

### From source

```bash
git clone https://github.com/yourusername/telegram-fetcher.git
cd telegram-fetcher
npm install
npm run build
npm link
```

### From npm (when published)

```bash
npm install -g telegram-fetcher
```

## Setup

### 1. Create a Telegram bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the instructions
3. Copy the bot token (looks like `123456:ABC-DEF...`)

### 2. Get your Telegram user ID

Send any message to [@userinfobot](https://t.me/userinfobot) - it will reply with your user ID.

### 3. Add your bot profile

```bash
telegram-fetch profile add
```

Enter your bot token and user ID when prompted.

## Usage

### First time in a directory

```bash
mkdir my-messages
cd my-messages
telegram-fetch init
```

Select your bot profile from the list. Optionally set a subdirectory for messages (e.g., `messages/`).

### Fetch messages

1. Send messages to your bot on Telegram
2. Run `telegram-fetch` in your directory
3. Messages appear as `.md` files with attachments downloaded

### Fetch again

Just run `telegram-fetch` again - it only fetches new messages since the last run.

## What gets saved

- **Messages with text** - Saved as `{number}.md` with date in YAML front matter
- **Files without text/caption** - Only the file is saved (no markdown file created)
- **Photos** - Saved as `{number}.jpg`
- **Voice messages** - Saved as `{number}.oga`
- **Documents** - Saved as `{number}_{filename}.pdf` (original filename preserved)
- **Multiple attachments** - Numbered as `{number}_1.jpg`, `{number}_2.jpg`, etc.

## Commands

```bash
# Add a new bot
telegram-fetch profile add

# List your bots
telegram-fetch profile list

# Remove a bot
telegram-fetch profile remove

# Set up a directory
telegram-fetch init

# Fetch new messages
telegram-fetch
```

## Files created

- `telegram-fetcher.config.json` - Which bot to use, optional output directory
- `.last-fetched-id` - Tracking file (keeps fetches incremental)
- `*.md` - Your messages with text content (in current directory or configured subdirectory)
- `*.jpg`, `*.pdf`, etc. - Your attachments (markdown only created if there's text/caption)

## Configuration Files

### Global profiles

Location: `~/.telegram-fetcher/profiles.json`

```json
{
  "my-bot": {
    "telegramBotToken": "123456:ABC-DEF...",
    "telegramUserId": 123456789,
    "botDescription": "My personal bot"
  }
}
```

### Local config

Location: `telegram-fetcher.config.json` (in your project directory)

```json
{
  "profile": "my-bot",
  "outputDir": "messages",
  "telegramUserId": 987654321
}
```

- `profile` - Which bot profile to use (required)
- `outputDir` - Subdirectory for messages (optional, default: current directory)
- `telegramUserId` - Override profile's user ID (optional)

## Important Warning

⚠️ **Files are overwritten** - If you fetch message `123` twice, `123.md` will be replaced. Don't run `telegram-fetch` in directories with important files unless you use `outputDir` to save to a subdirectory.

## Tips

- The bot only sees messages you send directly to it
- You need to press "Start" or send `/start` to the bot first
- Each directory can use a different bot
- Use `outputDir` to keep messages in a separate folder
- Add `.last-fetched-id` and `*.md` to your `.gitignore` if needed

## Troubleshooting

**No messages found?**
- Make sure you started the bot conversation (press "Start")
- Check you're sending messages to the correct bot
- Verify your user ID matches

**Want to use in multiple directories?**

Just run `telegram-fetch init` in each directory. They can all use the same bot profile.

## License

MIT
