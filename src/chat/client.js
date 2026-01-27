import { ChatClient } from "@twurple/chat";
import { StaticAuthProvider } from "@twurple/auth";
import config from "../config/config.js";
import { log, logError } from "../utils/logger.js";
import CommandHandler from "../commands/handler.js";

class TwitchChatClient {
  constructor() {
    this.client = null;
    this.commandHandler = null;
    this.pointsSystem = null;
    this.connected = false;
    this.messageCount = new Map(); // Track messages per user (userId -> count)
  }

  /**
   * Sets the points system for viewer tracking
   */
  setPointsSystem(pointsSystem) {
    this.pointsSystem = pointsSystem;
  }

  /**
   * Initializes and connects the Twitch chat client
   */
  async connect() {
    try {
      // Check if OAuth token is available
      if (!config.twitch.oauthToken) {
        throw new Error(
          "OAuth token is required. Please set TWITCH_OAUTH_TOKEN in your .env file."
        );
      }

      // Remove 'oauth:' prefix if present
      const token = config.twitch.oauthToken.replace("oauth:", "");

      // Create auth provider
      const authProvider = new StaticAuthProvider(
        config.twitch.clientId,
        token
      );

      // Create chat client
      this.client = new ChatClient({
        authProvider,
        channels: [config.twitch.channel],
      });

      this.commandHandler = new CommandHandler();
      this.commandHandler.setChatClient(this); // Pass reference to chat client

      // Set up event handlers
      this.setupEventHandlers();

      // Connect to Twitch
      await this.client.connect();

      log("success", `✅ Connected to Twitch as ${config.twitch.botUsername}`);
      log("info", `📺 Joined channel: ${config.twitch.channel}`);

      this.connected = true;
      return true;
    } catch (error) {
      logError("Failed to connect to Twitch", error);
      return false;
    }
  }

  /**
   * Sets up event handlers for the client
   */
  setupEventHandlers() {
    // Connection events
    this.client.onConnect(() => {
      log("success", `🔗 Connected to Twitch chat`);
    });

    this.client.onDisconnect((manually, reason) => {
      this.connected = false;
      log("warning", `⚠️  Disconnected: ${reason || "Unknown reason"}`);
    });

    // Message events
    this.client.onMessage(async (channel, user, message, msg) => {
      // Ignore messages from the bot itself
      if (user === config.twitch.botUsername.toLowerCase()) return;

      // Track message count for this user
      const userId = msg.userInfo.userId;
      const username = msg.userInfo.displayName;
      const currentCount = this.messageCount.get(userId) || {
        username,
        count: 0,
      };
      currentCount.count++;
      currentCount.username = username; // Update username in case it changed
      this.messageCount.set(userId, currentCount);

      // Track viewer for points system
      if (this.pointsSystem) {
        this.pointsSystem.trackViewer(userId, username);
      }

      // Handle commands
      if (message.startsWith(config.bot.prefix)) {
        const userstate = {
          "user-id": msg.userInfo.userId,
          "display-name": msg.userInfo.displayName,
          username: user,
          mod: msg.userInfo.isMod,
          subscriber: msg.userInfo.isSubscriber,
          badges: msg.userInfo.badges,
        };

        await this.commandHandler.handleCommand(
          this.client,
          channel,
          userstate,
          message,
          config
        );
      }
    });

    // Join/Part events
    this.client.onJoin((channel, user) => {
      if (user === config.twitch.botUsername.toLowerCase()) {
        log("success", `✅ Joined ${channel}`);
      }
    });

    this.client.onPart((channel, user) => {
      if (user === config.twitch.botUsername.toLowerCase()) {
        log("info", `👋 Left ${channel}`);
      }
    });
  }

  /**
   * Sends a message to the channel
   */
  async say(channel, message) {
    try {
      // Remove # from channel name if present
      const channelName = channel.replace("#", "");
      await this.client.say(channelName, message);
      return true;
    } catch (error) {
      logError(`Failed to send message to ${channel}`, error);
      return false;
    }
  }

  /**
   * Disconnects from Twitch
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      log("info", "👋 Disconnected from Twitch");
    }
  }

  /**
   * Gets the client instance
   */
  getClient() {
    return this.client;
  }

  /**
   * Gets the top N most active users by message count
   */
  getTopChatters(limit = 10) {
    const chatters = Array.from(this.messageCount.entries())
      .map(([userId, data]) => ({
        userId,
        username: data.username,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return chatters;
  }

  /**
   * Resets the message count (for new stream sessions)
   */
  resetMessageCount() {
    this.messageCount.clear();
    log("info", "📊 Message count reset");
  }
  /**
   * Checks if the client is connected
   */
  isConnected() {
    return this.connected;
  }
}

export default TwitchChatClient;
