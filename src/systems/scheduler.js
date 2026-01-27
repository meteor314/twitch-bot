import { getScheduledMessages, updateLastSent } from "../../database/db.js";
import { log } from "../utils/logger.js";

class ScheduledMessenger {
  constructor(chatClient, config) {
    this.chatClient = chatClient;
    this.config = config;
    this.intervals = new Map();
  }

  /**
   * Start scheduled messages
   */
  start() {
    const messages = getScheduledMessages();

    if (messages.length === 0) {
      log("info", "📅 Aucun message planifié configuré");
      return;
    }

    messages.forEach((msg) => {
      this.scheduleMessage(msg);
    });

    log("success", `📅 ${messages.length} message(s) planifié(s) démarré(s)`);
  }

  /**
   * Schedule a single message
   */
  scheduleMessage(msg) {
    const intervalMs = msg.interval_minutes * 60 * 1000;

    // Calculate initial delay
    let initialDelay = 0;
    if (msg.last_sent) {
      const lastSent = new Date(msg.last_sent);
      const now = new Date();
      const timeSinceLastSent = now - lastSent;
      const timeUntilNext = intervalMs - timeSinceLastSent;

      if (timeUntilNext > 0) {
        initialDelay = timeUntilNext;
      }
    } else {
      // First time, wait full interval
      initialDelay = intervalMs;
    }

    // Schedule first message
    setTimeout(() => {
      this.sendScheduledMessage(msg);

      // Then repeat at interval
      const interval = setInterval(() => {
        this.sendScheduledMessage(msg);
      }, intervalMs);

      this.intervals.set(msg.id, interval);
    }, initialDelay);

    log(
      "info",
      `📅 Message planifié: "${msg.message.substring(0, 30)}..." (${
        msg.interval_minutes
      }min)`
    );
  }

  /**
   * Send a scheduled message
   */
  async sendScheduledMessage(msg) {
    try {
      const channel = this.config.twitch.channel;
      await this.chatClient.say(channel, msg.message);
      updateLastSent(msg.id);
      log(
        "info",
        `📤 Message planifié envoyé: ${msg.message.substring(0, 50)}...`
      );
    } catch (error) {
      log("error", `Erreur envoi message planifié: ${error.message}`);
    }
  }

  /**
   * Stop all scheduled messages
   */
  stop() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
    log("info", "📅 Messages planifiés arrêtés");
  }

  /**
   * Reload scheduled messages
   */
  reload() {
    this.stop();
    this.start();
  }
}

export default ScheduledMessenger;
