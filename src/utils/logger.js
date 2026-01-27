/**
 * Simple logging utility with color-coded output
 */

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

/**
 * Formats a timestamp
 */
function getTimestamp() {
  return new Date().toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Logs a message with a specific type
 */
export function log(type, message) {
  const timestamp = getTimestamp();

  switch (type) {
    case "error":
      console.log(`${colors.red}[${timestamp}] ❌ ${message}${colors.reset}`);
      break;
    case "warning":
      console.log(
        `${colors.yellow}[${timestamp}] ⚠️  ${message}${colors.reset}`
      );
      break;
    case "success":
      console.log(`${colors.green}[${timestamp}] ${message}${colors.reset}`);
      break;
    case "info":
      console.log(`${colors.cyan}[${timestamp}] ${message}${colors.reset}`);
      break;
    case "chat":
      console.log(`${colors.white}[${timestamp}] ${message}${colors.reset}`);
      break;
    case "command":
      console.log(
        `${colors.magenta}[${timestamp}] 🔧 ${message}${colors.reset}`
      );
      break;
    default:
      console.log(`[${timestamp}] ${message}`);
  }
}

/**
 * Logs an error with stack trace
 */
export function logError(message, error) {
  log("error", message);
  if (error) {
    console.error(
      `${colors.red}${error.stack || error.message || error}${colors.reset}`
    );
  }
}

/**
 * Logs command execution
 */
export function logCommand(channel, user, command) {
  log("command", `${user} used ${command} in ${channel}`);
}

export default { log, logError, logCommand };
