# TwitchBot - Twitch Chat Bot 🤖

A modular and reliable Twitch bot with dynamic command system, loyalty points, and scheduled messages.

## ✨ Features

- 🔐 **Secure OAuth Authentication** with integrated token generator
- 📦 **Modular Architecture** easy to extend
- ⚡ **Command System** with cooldowns and permissions
- 💎 **Loyalty/Points System** automatic (5pts/5min)
- 📅 **Scheduled Messages** with customizable intervals
- ✏️ **Custom Commands** dynamically created (in chat via !add)
- 📤 **JSON Export** of all commands
- 🏆 **Leaderboard** of most active viewers
- 🔄 **Auto-reconnect** in case of disconnection
- 🛡️ **Error Handling** and complete logging
- 🌐 **Multi-language** support (French/English)

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- Twitch application created on [dev.twitch.tv](https://dev.twitch.tv/console)
- Twitch bot account (e.g., twitchBot)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the information in `.env` https://dev.twitch.tv/docs/authentication/register-app: 
  For the redirect URL, use `http://localhost:3000/oauth/twitch/callback`
   ```env
   TWITCH_CLIENT_ID=0shem0dt8f0smk0hv5ta29gmb6iwjx
   TWITCH_CLIENT_SECRET=your_client_secret_here
   TWITCH_OAUTH_TOKEN=your_oauth_token_here
   TWITCH_CHANNEL=meteor_314
   TWITCH_BOT_USERNAME=twitchBot
   TWITCH_OWNER=meteor_314
   BOT_PREFIX=!
   ```

### 4. Get an OAuth Token

**Recommended method - Integrated generator:**
```bash
npm run get-token
```

This will:
1. Start a local web server on http://localhost:3000
2. Automatically open your browser
3. Guide you through Twitch authorization
4. Display your OAuth token to copy into `.env`

⚠️ **Important:** Log in with your **bot account** (twitchBot), not your personal account!

### 5. Start the Bot

```bash
npm start
```

Development mode with auto-reload:
```bash
npm run dev
```

## 📂 Project Structure

```
meteorBot/
├── src/
│   ├── index.js                    # Main entry point
│   ├── config/
│   │   └── config.js               # Configuration loader
│   ├── auth/
│   │   └── auth.js                 # Authentication
│   ├── chat/
│   │   └── client.js               # Twitch chat client
│   ├── commands/
│   │   ├── handler.js              # Command handler
│   │   └── commands/               # Individual commands
│   │       ├── add.js              # Create custom command
│   │       ├── edit.js             # Edit command
│   │       ├── remove.js           # Remove command
│   │       ├── commands.js         # List all commands
│   │       ├── rank.js             # Show viewer points
│   │       ├── leaderboard.js      # Top 5 viewers
│   │       ├── export.js           # Export commands to JSON
│   │       ├── schedule.js         # Add scheduled message
│   │       ├── schedules.js        # List scheduled messages
│   │       ├── toggleschedule.js   # Enable/disable message
│   │       ├── removeschedule.js   # Remove scheduled message
│   │       ├── ban.js              # Ban user
│   │       ├── timeout.js          # Timeout user
│   │       ├── alias.js            # Create command aliases
│   │       └── title.js            # Display stream title
│   ├── systems/
│   │   ├── points.js               # Points system (5pts/5min)
│   │   └── scheduler.js            # Automatic scheduled messages
│   └── utils/
│       ├── logger.js               # Logging utility
│       └── cooldown.js             # Cooldown manager
├── database/
│   └── db.js                       # SQLite manager (custom_commands, user_points, scheduled_messages, command_aliases)
├── exports/                        # Folder for JSON exports (auto-created)
├── get-token.js                    # OAuth token generator
├── .env                            # Your credentials (git ignored)
├── .env.example                    # Example configuration
├── COMMANDS_GUIDE.md               # Complete commands guide
└── package.json                    # Dependencies
```

## 💡 Usage Guide

### Basic Commands

**For all viewers:**
- `!commands` - List all available commands
- `!title` - Display stream title
- `!rank` (or `!points`, `!score`) - Display your points and watch time
- `!leaderboard` (or `!top`, `!classement`) - Top 5 viewers

**For moderators/owner:**
- `!add <name> <response>` - Create a custom command
- `!edit <name> <response>` - Edit a command
- `!remove <name>` - Remove a command
- `!ban @username [reason]` - Ban a user
- `!timeout @username <minutes> [reason]` - Timeout a user
- `!alias <alias> <command>` - Create a command alias
- `!schedules` - List scheduled messages

**For owner only:**
- `!export` - Export all commands to JSON
- `!schedule <minutes> <message>` - Add a scheduled message
- `!toggleschedule <id>` - Enable/disable a message
- `!removeschedule <id>` - Remove a scheduled message

### Command Creation Examples

```bash
# Create basic commands
!add hello Hi {user}! Welcome to the stream 👋
!add lurk {user} is now lurking 👀
!add socials All my socials: https://meteor314.com/fr/social.html
!add discord Join the Discord: https://discord.gg/feSFNbgSEH 🎮

# Edit a command
!edit hello Hey {user}! How are you? 😊

# Remove a command
!remove hello

# Create command aliases
!alias exports export
!alias to timeout

# Add automatic messages
!schedule 30 Don't forget to follow if you enjoy the stream! 💜
!schedule 45 Join our Discord: https://discord.gg/feSFNbgSEH

# Moderation commands
!ban @baduser Spamming
!timeout @user 10 Please be respectful
```

Check [COMMANDS_GUIDE.md](COMMANDS_GUIDE.md) for the complete guide with all details.

## 💎 Points System

The bot automatically rewards your active viewers:
- **5 points** every **5 minutes** for each viewer who sent at least 1 message
- **Watch time** is tracked in minutes
- Use `!rank` command to view your personal stats
- Use `!leaderboard` command for the global top 5

Data is stored in `database/commands.db` (SQLite).

## 📅 Scheduled Messages

Envoyez automatiquement des messages à intervalles réguliers:
1. Ajouter un message: `!schedule 30 N'oublie pas de follow !`
2. Redémarrer le bot: `npm start`
3. Le message sera envoyé toutes les 30 minutes

Gérer les messages:
- `!schedules` - Voir tous les messages configurés
- `!toggleschedule 1` - Désactiver temporairement le message #1
- `!removeschedule 1` - Supprimer définitivement le message #1

## 📤 Command Export

Export all your custom commands to JSON:
```bash
!export
```

Creates a file in `exports/commands_export_[timestamp].json` with:
- Complete list of all commands (hardcoded + custom)
- Usage statistics (`use_count`)
- Metadata (creator, dates, etc.)
- Markdown documentation (`COMMANDS_LIST.md`)

Perfect for:
- Backing up your commands
- Sharing on meteor314.com
- Documenting your bot

## 🔧 Development

### Ajouter une Nouvelle Commande Système

Créer un fichier dans `src/commands/commands/`:

```javascript
export default {
  name: "macommande",
  aliases: ["alias1", "alias2"],
  description: "Description de la commande",
  cooldown: 10, // en secondes
  modOnly: false,
  ownerOnly: false,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];
    
    // Logique de la commande
    return `@${username} Réponse de la commande`;
  },
};
```

Le fichier sera automatiquement chargé au démarrage du bot.

### Structure d'une Commande

- `name`: Nom de la commande (sans le prefix !)
- `aliases`: Array de noms alternatifs (optionnel)
- `description`: Description courte
- `cooldown`: Temps en secondes entre deux utilisations
- `modOnly`: true = modérateurs uniquement
- `ownerOnly`: true = owner uniquement
- `execute()`: Asynchronous function that returns the response (string)

### Database

The bot uses **SQLite** (better-sqlite3) with 4 tables:

**custom_commands:**
- Commands created via `!add`
- Fields: id, name, response, created_by, created_at, updated_at, use_count

**command_aliases:**
- Command aliases created via `!alias`
- Fields: id, alias_name, target_command, created_by, created_at

**user_points:**
- Viewer points and watch time
- Fields: id, user_id, username, points, watch_time, last_seen, created_at

**scheduled_messages:**
- Automatic messages
- Fields: id, message, interval_minutes, enabled, last_sent, created_at

Access the DB:
```bash
sqlite3 database/commands.db
.tables
SELECT * FROM user_points ORDER BY points DESC LIMIT 10;
```

## 🐛 Troubleshooting

### Le bot ne se connecte pas
- Vérifier que `TWITCH_OAUTH_TOKEN` est bien rempli dans `.env`
- Vérifier que le token n'a pas expiré (relancer `npm run get-token`)
- Vérifier que `TWITCH_BOT_USERNAME` correspond au compte utilisé pour générer le token

### Les commandes ne fonctionnent pas
- Vérifier que le prefix est correct (défaut: `!`)
- Vérifier les permissions (certaines commandes sont mod/owner only)
- Consulter les logs dans le terminal

### Les points ne s'accumulent pas
- Vous devez envoyer au moins 1 message toutes les 5 minutes
- Vérifier que le bot affiche: `✅ Points system started (5pts every 5min)`

### Les messages planifiés ne s'envoient pas
- Redémarrer le bot après avoir ajouté un message avec `!schedule`
- Vérifier que le message est activé: `!schedules` doit afficher ✅
- Vérifier les logs: `Envoi du message planifié`

## 📚 Main Dependencies

- [@twurple/chat](https://www.npmjs.com/package/@twurple/chat) v7.1.0 - Modern Twitch chat client
- [@twurple/auth](https://www.npmjs.com/package/@twurple/auth) v7.1.0 - Twitch authentication
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) v12.5.0 - High-performance SQLite database
- [express](https://www.npmjs.com/package/express) v4.21.2 - Web server for OAuth
- [dotenv](https://www.npmjs.com/package/dotenv) - Environment variable management
- [axios](https://www.npmjs.com/package/axios) v1.7.2 - HTTP client for Twitch API

## 🔗 Useful Links

- **Twitch API Documentation:** https://dev.twitch.tv/docs/
- **Twitch Developer Console:** https://dev.twitch.tv/console
- **@twurple Documentation:** https://twurple.js.org/
- **meteor314 Discord:** https://discord.gg/feSFNbgSEH
- **Website:** https://meteor314.com

## 📝 Changelog

### Version 1.0 (January 2025)
- ✅ Migration from tmi.js to @twurple (modern and maintained library)
- ✅ Integrated OAuth generator (replaces discontinued twitchapps.com/tmi)
- ✅ Dynamic command system with SQLite
- ✅ Points/loyalty system (5pts/5min for active viewers)
- ✅ Automatic scheduled messages with customizable intervals
- ✅ Viewer leaderboard
- ✅ JSON command export with markdown documentation
- ✅ Command aliases system
- ✅ Moderation commands (ban, timeout)
- ✅ Multi-language interface (French/English)
- ✅ Modular and extensible architecture

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - See the LICENSE file for more details.

## 👤 Author

**meteor_314**
- Twitch: [meteor_314](https://twitch.tv/meteor_314)
- Discord: https://discord.gg/feSFNbgSEH
- Site web: https://meteor314.com

---

⭐ Si ce bot t'est utile, n'hésite pas à laisser une étoile sur GitHub !

