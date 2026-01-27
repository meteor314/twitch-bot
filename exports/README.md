# Commands Export Folder

This folder contains automatically generated command exports.

## Files

- **COMMANDS_LIST_FR.md** - Complete list of all bot commands in French
- **COMMANDS_LIST_EN.md** - Complete list of all bot commands in English
- **commands_export_[timestamp].json** - JSON export with all command data

## Usage

Users can view the complete command list by typing `!commands` in chat, which provides links to:
- 🇫🇷 French: https://github.com/meteor314/twitch-bot/blob/master/exports/COMMANDS_LIST_FR.md
- 🇬🇧 English: https://github.com/meteor314/twitch-bot/blob/master/exports/COMMANDS_LIST_EN.md

## Generating Exports

To regenerate these files, use the `!export` command in chat (Owner only):
```
!export
```

This will:
1. Delete old JSON files and outdated markdown files
2. Create a new timestamped JSON export
3. Generate updated COMMANDS_LIST_FR.md and COMMANDS_LIST_EN.md files

## File Structure

### Markdown Files
Both markdown files contain:
- Bot information and export timestamp
- Complete list of hardcoded commands with descriptions, usage, and access levels
- Complete list of custom commands with responses and statistics
- How-to guide for managing commands

### JSON Files
JSON files contain:
- Export metadata (timestamp, bot name, channel)
- Array of hardcoded commands with full details
- Array of custom commands from the database
- Usage statistics and creation information
