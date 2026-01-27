# 🏗️ Bot Architecture

## How Everything Works Together

```
┌─────────────────────────────────────────────────────────────┐
│                         USER TYPES                          │
│                    "!ping" in Twitch Chat                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    TWITCH IRC SERVER                        │
│                  (chat.twitch.tv:6667)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   src/chat/client.js                        │
│               (TwitchChatClient - tmi.js)                   │
│                                                             │
│  • Connects to Twitch IRC                                   │
│  • Listens for messages                                     │
│  • Auto-reconnects on disconnect                            │
│  • Sends responses back to chat                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              src/commands/handler.js                        │
│                   (CommandHandler)                          │
│                                                             │
│  1. Checks if message starts with prefix (!)                │
│  2. Parses command name and arguments                       │
│  3. Checks if user is on cooldown                           │
│  4. Executes command                                        │
│  5. Sets cooldown                                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            src/commands/commands/*.js                       │
│                 (Individual Commands)                       │
│                                                             │
│  ping.js      → Returns "Pong!"                             │
│  hello.js     → Random greeting                             │
│  uptime.js    → Calls Twitch API for stream uptime          │
│  commands.js  → Lists available commands                    │
│  roll.js      → Random number generator                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    RESPONSE SENT                            │
│              "@User 🏓 Pong! Bot is online"                 │
│                   (back to Twitch chat)                     │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 🚀 Entry Point: `src/index.js`

**Purpose**: Starts the bot

**Flow**:

1. Load configuration from `.env`
2. Validate OAuth token
3. Initialize chat client
4. Connect to Twitch
5. Handle graceful shutdown (Ctrl+C)

**Dependencies**: All other modules

---

### ⚙️ Configuration: `src/config/config.js`

**Purpose**: Manages all bot settings

**Loads**:

- Twitch credentials (Client ID, Secret, OAuth)
- Bot settings (prefix, channel, owner)
- Connection settings (reconnect, SSL)

**Validates**: Ensures required values are present

**Used by**: All modules

---

### 🔐 Authentication: `src/auth/`

#### `auth.js`

- Validates OAuth tokens
- Gets app access tokens
- Refreshes expired tokens

#### `oauth.js` (Optional)

- Sets up OAuth flow
- Provides authorization URL
- Exchanges codes for tokens

**Used by**: index.js, uptime command

---

### 💬 Chat Client: `src/chat/client.js`

**Purpose**: Connects to Twitch and handles messages

**Responsibilities**:

- Connect to Twitch IRC using tmi.js
- Listen for chat messages
- Forward commands to CommandHandler
- Send responses back to chat
- Handle reconnections
- Manage connection events

**Event Handlers**:

- `message` → Process incoming messages
- `connected` → Log successful connection
- `disconnected` → Handle disconnection
- `error` → Log errors

---

### 🎮 Command System: `src/commands/`

#### `handler.js` (CommandHandler)

**Purpose**: Manages command execution

**Flow**:

1. Parse message (split command & args)
2. Find command in registry
3. Check permissions (owner-only)
4. Check cooldown
5. Execute command
6. Set new cooldown

**Features**:

- Auto-loads commands from `commands/` folder
- Per-user cooldown tracking
- Error handling

#### `commands/*.js` (Individual Commands)

**Structure**:

```javascript
export default {
  name: "commandname",
  description: "What it does",
  cooldown: 10, // seconds
  ownerOnly: false, // only bot owner?

  async execute(client, channel, userstate, args, config) {
    // Command logic here
    return "Response message";
  },
};
```

**Available**:

- `ping.js` - Test response
- `hello.js` - Random greeting
- `uptime.js` - Stream uptime (API call)
- `commands.js` - List commands
- `roll.js` - Random number

---

### 🛠️ Utilities: `src/utils/`

#### `logger.js`

- Color-coded console output
- Timestamp formatting
- Different log levels (info, error, success, warning)

#### `cooldown.js` (CooldownManager)

- Tracks per-user command cooldowns
- Prevents command spam
- Auto-cleanup of expired cooldowns

---

## 🔄 Complete Flow Example

```
User types: "!uptime"
     ↓
Twitch IRC → chat/client.js
     ↓
Message detected, starts with "!"
     ↓
commands/handler.js
     ↓
Parse: command="uptime", args=[]
     ↓
Check: Is user on cooldown? No
     ↓
Execute: commands/uptime.js
     ↓
uptime.js:
  1. Get app access token (auth/auth.js)
  2. Call Twitch API for stream data
  3. Calculate uptime
  4. Format message
     ↓
Return: "📺 Stream has been live for 2h 34m 12s"
     ↓
commands/handler.js sets cooldown
     ↓
chat/client.js sends response
     ↓
Message appears in Twitch chat!
```

## 📦 Dependencies

```
tmi.js      → Twitch IRC client
dotenv      → Environment variable loader
axios       → HTTP client for API calls
```

## 🔧 Configuration Flow

```
.env file
    ↓
dotenv.config()
    ↓
src/config/config.js
    ↓
Validates required values
    ↓
Exports config object
    ↓
Used by all modules
```

## 🎯 Design Principles

### 1. **Separation of Concerns**

- Each module has a single responsibility
- Easy to test and maintain

### 2. **Modularity**

- Commands are separate files
- Easy to add/remove features

### 3. **Configuration**

- All settings in one place (.env)
- No hardcoded values

### 4. **Error Handling**

- Try-catch blocks everywhere
- Graceful failures
- Helpful error messages

### 5. **Reliability**

- Auto-reconnect on disconnect
- Token validation
- Cooldown management

## 🚀 Extending the Bot

### Add a New Command

1. Create `src/commands/commands/yourcommand.js`
2. Follow the command structure
3. Restart bot → Auto-loaded!

### Add API Integration

1. Import axios in your command
2. Make API call in execute()
3. Return formatted response

### Add Database

1. Install database library (sqlite3, pg, etc.)
2. Create `src/database/` folder
3. Initialize in index.js
4. Use in commands

### Add Web Dashboard

1. Create `src/web/` folder
2. Set up Express server
3. Create API endpoints
4. Build frontend (React, Vue, etc.)

## 💡 Tips

- **Test locally first** - Use your own channel
- **Check logs** - Console shows everything
- **Start simple** - Get basic commands working first
- **Read Twitch docs** - API has many features
- **Ask for help** - Twitch dev community is helpful!

---

This architecture ensures your bot is:
✅ Easy to understand
✅ Simple to extend
✅ Reliable in production
✅ Maintainable long-term

Happy building! 🎉
