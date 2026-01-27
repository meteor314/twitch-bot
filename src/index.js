import config, { validateConfig } from "./config/config.js";
import TwitchChatClient from "./chat/client.js";
import { log, logError } from "./utils/logger.js";
import { validateToken } from "./auth/auth.js";
import PointsSystem from "./systems/points.js";
import ScheduledMessenger from "./systems/scheduler.js";

/**
 * Main bot application
 */
class MeteorBot {
  constructor() {
    this.chatClient = null;
    this.pointsSystem = null;
    this.scheduler = null;
    this.running = false;
  }

  /**
   * Starts the bot
   */
  async start() {
    try {
      // Display banner
      this.displayBanner();

      // Validate configuration
      log("info", "🔍 Validating configuration...");
      validateConfig();
      log("success", "✅ Configuration valid");

      // Validate OAuth token if available
      if (config.twitch.oauthToken) {
        log("info", "🔑 Validating OAuth token...");
        const validation = await validateToken(config.twitch.oauthToken);

        if (validation.valid) {
          log(
            "success",
            `✅ Token valid - Authenticated as: ${validation.data.login}`,
          );
        } else {
          log("error", "❌ Token validation failed");
          log("error", "Run: npm run get-token");
          process.exit(1);
        }
      }

      // Initialize chat client
      log("info", "🤖 Initializing chat client...");
      this.chatClient = new TwitchChatClient();

      // Connect to Twitch
      const connected = await this.chatClient.connect();

      if (!connected) {
        log("error", "❌ Failed to connect to Twitch");
        process.exit(1);
      }

      // Initialize points system
      log("info", "💎 Initializing points system...");
      this.pointsSystem = new PointsSystem(this.chatClient, config);
      this.chatClient.setPointsSystem(this.pointsSystem);
      this.pointsSystem.start();
      log("success", "✅ Points system started (5pts every 5min)");

      // Initialize scheduled messages
      log("info", "📅 Initializing scheduled messages...");
      this.scheduler = new ScheduledMessenger(this.chatClient, config);
      this.scheduler.start();
      log("success", "✅ Scheduled messages started");

      this.running = true;
      log("success", "🎉 Bot is now running!");
      log("info", `💬 Listening in channel: #${config.twitch.channel}`);
      log("info", `⚡ Command prefix: ${config.bot.prefix}`);
      log("info", "");
      log("info", "📝 Type Ctrl+C to stop the bot");
    } catch (error) {
      logError("Failed to start bot", error);
      process.exit(1);
    }
  }

  /**
   * Stops the bot gracefully
   */
  async stop() {
    if (this.running) {
      log("info", "🛑 Shutting down bot...");

      // Stop points system
      if (this.pointsSystem) {
        this.pointsSystem.stop();
        log("info", "💎 Points system stopped");
      }

      // Stop scheduler
      if (this.scheduler) {
        this.scheduler.stop();
        log("info", "📅 Scheduler stopped");
      }

      // Disconnect chat client
      if (this.chatClient) {
        await this.chatClient.disconnect();
      }

      this.running = false;
      log("success", "✅ Bot stopped successfully");
    }
  }

  /**
   * Displays the bot banner
   */
  displayBanner() {
    console.log("\n");
    console.log("╔═══════════════════════════════════════╗");
    console.log("║                                       ║");
    console.log("║        🤖 twitchBot v1.0 🚀          ║");
    console.log("║                                       ║");
    console.log("║      Twitch Chat Bot - Starting       ║");
    console.log("║                                       ║");
    console.log("╚═══════════════════════════════════════╝");
    console.log("\n");
  }
}

// Create bot instance
const bot = new MeteorBot();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n");
  await bot.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await bot.stop();
  process.exit(0);
});

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logError("Uncaught exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logError("Unhandled rejection at", promise);
  logError("Reason", reason);
  process.exit(1);
});

// Start the bot
bot.start();
