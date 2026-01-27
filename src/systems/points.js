import { addUserPoints, updateWatchTime } from "../../database/db.js";
import { log } from "../utils/logger.js";

class PointsSystem {
  constructor(chatClient, config) {
    this.chatClient = chatClient;
    this.config = config;
    this.activeViewers = new Set();
    this.pointsInterval = null;
  }

  /**
   * Start the points system
   */
  start() {
    // Award points every 5 minutes
    this.pointsInterval = setInterval(() => {
      this.awardPoints();
    }, 5 * 60 * 1000); // 5 minutes

    log("success", "💎 Système de points démarré (5pts/5min)");
  }

  /**
   * Track active viewer
   */
  trackViewer(userId, username) {
    this.activeViewers.add(JSON.stringify({ userId, username }));
  }

  /**
   * Award points to active viewers
   */
  awardPoints() {
    if (this.activeViewers.size === 0) {
      return;
    }

    let awarded = 0;
    this.activeViewers.forEach((viewerData) => {
      const { userId, username } = JSON.parse(viewerData);

      // Award 5 points for being active
      addUserPoints(userId, username, 5);

      // Track 5 minutes of watch time
      updateWatchTime(userId, username, 5);

      awarded++;
    });

    log("info", `💎 ${awarded} viewer(s) ont reçu 5 points`);

    // Clear active viewers for next interval
    this.activeViewers.clear();
  }

  /**
   * Award bonus points (for special events)
   */
  awardBonus(userId, username, points, reason) {
    addUserPoints(userId, username, points);
    log("info", `💎 Bonus: ${username} +${points}pts (${reason})`);
  }

  /**
   * Stop the points system
   */
  stop() {
    if (this.pointsInterval) {
      clearInterval(this.pointsInterval);
      this.pointsInterval = null;
    }
    this.activeViewers.clear();
    log("info", "💎 Système de points arrêté");
  }
}

export default PointsSystem;
