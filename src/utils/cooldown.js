/**
 * Manages command cooldowns to prevent spam
 */
class CooldownManager {
  constructor() {
    this.cooldowns = new Map();
  }

  /**
   * Checks if a user is on cooldown for a command
   */
  isOnCooldown(userId, commandName, cooldownTime) {
    const key = `${userId}-${commandName}`;
    const now = Date.now();

    if (this.cooldowns.has(key)) {
      const expirationTime = this.cooldowns.get(key);

      if (now < expirationTime) {
        const timeLeft = Math.ceil((expirationTime - now) / 1000);
        return { onCooldown: true, timeLeft };
      }
    }

    return { onCooldown: false };
  }

  /**
   * Sets a cooldown for a user and command
   */
  setCooldown(userId, commandName, cooldownTime) {
    const key = `${userId}-${commandName}`;
    const expirationTime = Date.now() + cooldownTime * 1000;

    this.cooldowns.set(key, expirationTime);

    // Clean up expired cooldowns periodically
    this.cleanupExpiredCooldowns();
  }

  /**
   * Removes expired cooldowns from memory
   */
  cleanupExpiredCooldowns() {
    const now = Date.now();

    for (const [key, expirationTime] of this.cooldowns.entries()) {
      if (now >= expirationTime) {
        this.cooldowns.delete(key);
      }
    }
  }

  /**
   * Clears all cooldowns
   */
  clearAllCooldowns() {
    this.cooldowns.clear();
  }

  /**
   * Clears cooldowns for a specific user
   */
  clearUserCooldowns(userId) {
    for (const [key] of this.cooldowns.entries()) {
      if (key.startsWith(`${userId}-`)) {
        this.cooldowns.delete(key);
      }
    }
  }
}

export default CooldownManager;
