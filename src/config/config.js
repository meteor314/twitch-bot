import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Configuration object for the bot
 */
const config = {
  // Twitch credentials
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    botUsername: process.env.TWITCH_BOT_USERNAME,
    oauthToken: process.env.TWITCH_OAUTH_TOKEN,
    channel: process.env.TWITCH_CHANNEL,
    redirectUri: process.env.TWITCH_REDIRECT_URI,
  },

  // Bot settings
  bot: {
    prefix: process.env.BOT_PREFIX || "!",
    owner: process.env.BOT_OWNER,
  },

  // Connection settings
  connection: {
    reconnect: true,
    maxReconnectAttempts: 10,
    maxReconnectInterval: 30000,
    reconnectDecay: 1.5,
    reconnectInterval: 1000,
    secure: true,
  },
};

/**
 * Validates that all required config values are present
 */
export function validateConfig() {
  const required = ["twitch.clientId", "twitch.botUsername", "twitch.channel"];

  const missing = required.filter((key) => {
    const value = key.split(".").reduce((obj, prop) => obj?.[prop], config);
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required configuration: ${missing.join(
        ", "
      )}\nPlease check your .env file.`
    );
  }

  // Warn if OAuth token is missing
  if (!config.twitch.oauthToken) {
    console.warn(
      "⚠️  WARNING: TWITCH_OAUTH_TOKEN not set. You need an OAuth token to connect to chat."
    );
    console.warn("   Run: npm run get-token");
  }
}

export default config;
