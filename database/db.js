import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "commands.db");

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS custom_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL COLLATE NOCASE,
    response TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    use_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS command_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias_name TEXT UNIQUE NOT NULL COLLATE NOCASE,
    target_command TEXT NOT NULL COLLATE NOCASE,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    watch_time INTEGER DEFAULT 0,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scheduled_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    interval_minutes INTEGER NOT NULL,
    enabled INTEGER DEFAULT 1,
    last_sent DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

/**
 * Add a custom command
 */
export function addCustomCommand(name, response, createdBy) {
  try {
    const stmt = db.prepare(`
      INSERT INTO custom_commands (name, response, created_by)
      VALUES (?, ?, ?)
    `);
    stmt.run(name.toLowerCase(), response, createdBy);
    return { success: true };
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      return { success: false, error: "Cette commande existe déjà" };
    }
    return { success: false, error: error.message };
  }
}

/**
 * Get a custom command
 */
export function getCustomCommand(name) {
  const stmt = db.prepare(`
    SELECT * FROM custom_commands WHERE name = ? COLLATE NOCASE
  `);
  return stmt.get(name.toLowerCase());
}

/**
 * Update a custom command
 */
export function updateCustomCommand(name, newResponse) {
  try {
    const stmt = db.prepare(`
      UPDATE custom_commands 
      SET response = ?, updated_at = CURRENT_TIMESTAMP
      WHERE name = ? COLLATE NOCASE
    `);
    const result = stmt.run(newResponse, name.toLowerCase());

    if (result.changes === 0) {
      return { success: false, error: "Commande introuvable" };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Remove a custom command
 */
export function removeCustomCommand(name) {
  try {
    const stmt = db.prepare(`
      DELETE FROM custom_commands WHERE name = ? COLLATE NOCASE
    `);
    const result = stmt.run(name.toLowerCase());

    if (result.changes === 0) {
      return { success: false, error: "Commande introuvable" };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Increment use count
 */
export function incrementUseCount(name) {
  const stmt = db.prepare(`
    UPDATE custom_commands 
    SET use_count = use_count + 1
    WHERE name = ? COLLATE NOCASE
  `);
  stmt.run(name.toLowerCase());
}

/**
 * Get all custom commands
 */
export function getAllCustomCommands() {
  const stmt = db.prepare(`
    SELECT name, response, created_by, use_count, created_at
    FROM custom_commands
    ORDER BY name ASC
  `);
  return stmt.all();
}

/**
 * Get command count
 */
export function getCommandCount() {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM custom_commands
  `);
  return stmt.get().count;
}

// ==================== COMMAND ALIASES ====================

/**
 * Add a command alias
 */
export function addCommandAlias(aliasName, targetCommand, createdBy) {
  try {
    const stmt = db.prepare(`
      INSERT INTO command_aliases (alias_name, target_command, created_by)
      VALUES (?, ?, ?)
    `);
    stmt.run(aliasName.toLowerCase(), targetCommand.toLowerCase(), createdBy);
    return { success: true };
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      return { success: false, error: "Cet alias existe déjà" };
    }
    return { success: false, error: error.message };
  }
}

/**
 * Get command alias
 */
export function getCommandAlias(aliasName) {
  const stmt = db.prepare(`
    SELECT * FROM command_aliases WHERE alias_name = ? COLLATE NOCASE
  `);
  return stmt.get(aliasName.toLowerCase());
}

/**
 * Get all aliases for a command
 */
export function getAliasesForCommand(commandName) {
  const stmt = db.prepare(`
    SELECT alias_name FROM command_aliases WHERE target_command = ? COLLATE NOCASE
  `);
  return stmt.all(commandName.toLowerCase());
}

/**
 * Remove a command alias
 */
export function removeCommandAlias(aliasName) {
  try {
    const stmt = db.prepare(`
      DELETE FROM command_aliases WHERE alias_name = ? COLLATE NOCASE
    `);
    const result = stmt.run(aliasName.toLowerCase());

    if (result.changes === 0) {
      return { success: false, error: "Alias introuvable" };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all command aliases
 */
export function getAllCommandAliases() {
  const stmt = db.prepare(`
    SELECT alias_name, target_command, created_by, created_at
    FROM command_aliases
    ORDER BY alias_name ASC
  `);
  return stmt.all();
}

/**
 * Close database connection
 */
export function closeDatabase() {
  db.close();
}

// ==================== POINTS SYSTEM ====================

/**
 * Add or update user points
 */
export function addUserPoints(userId, username, points) {
  const stmt = db.prepare(`
    INSERT INTO user_points (user_id, username, points, last_seen)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      points = points + excluded.points,
      username = excluded.username,
      last_seen = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, username, points);
}

/**
 * Get user points
 */
export function getUserPoints(userId) {
  const stmt = db.prepare(`
    SELECT * FROM user_points WHERE user_id = ?
  `);
  return stmt.get(userId);
}

/**
 * Get top users by points
 */
export function getTopUsers(limit = 10) {
  const stmt = db.prepare(`
    SELECT username, points, watch_time
    FROM user_points
    ORDER BY points DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}

/**
 * Update watch time
 */
export function updateWatchTime(userId, username, minutes) {
  const stmt = db.prepare(`
    INSERT INTO user_points (user_id, username, watch_time, last_seen)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      watch_time = watch_time + excluded.watch_time,
      username = excluded.username,
      last_seen = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, username, minutes);
}

// ==================== SCHEDULED MESSAGES ====================

/**
 * Add scheduled message
 */
export function addScheduledMessage(message, intervalMinutes) {
  const stmt = db.prepare(`
    INSERT INTO scheduled_messages (message, interval_minutes)
    VALUES (?, ?)
  `);
  stmt.run(message, intervalMinutes);
  return { success: true };
}

/**
 * Get all scheduled messages
 */
export function getScheduledMessages() {
  const stmt = db.prepare(`
    SELECT * FROM scheduled_messages WHERE enabled = 1
  `);
  return stmt.all();
}

/**
 * Update last sent time
 */
export function updateLastSent(messageId) {
  const stmt = db.prepare(`
    UPDATE scheduled_messages SET last_sent = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run(messageId);
}

/**
 * Remove scheduled message
 */
export function removeScheduledMessage(messageId) {
  const stmt = db.prepare(`
    DELETE FROM scheduled_messages WHERE id = ?
  `);
  const result = stmt.run(messageId);
  return { success: result.changes > 0 };
}

/**
 * Toggle scheduled message
 */
export function toggleScheduledMessage(messageId, enabled) {
  const stmt = db.prepare(`
    UPDATE scheduled_messages SET enabled = ? WHERE id = ?
  `);
  stmt.run(enabled ? 1 : 0, messageId);
}

export default db;
