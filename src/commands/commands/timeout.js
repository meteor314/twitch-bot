/**
 * Timeout a user from chat - Mod only
 */
export default {
  name: "timeout",
  description: "Mettre un utilisateur en timeout (Mod uniquement)",
  usage: "!timeout @username <minutes> [reason]",
  aliases: ["to"],
  cooldown: 3,
  ownerOnly: false,
  modOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    // Check if username and duration are provided
    if (args.length < 2) {
      return `@${username} Usage: !timeout @username <minutes> [reason]`;
    }

    // Extract username (remove @ if present)
    const targetUser = args[0].replace(/^@/, "").toLowerCase();
    const duration = parseInt(args[1]);
    const reason = args.slice(2).join(" ") || "No reason provided";

    // Validate duration
    if (isNaN(duration) || duration <= 0) {
      return `@${username} ❌ La durée doit être un nombre positif (en minutes).`;
    }

    // Prevent timing out broadcaster or bot
    if (targetUser === config.twitch.channel.toLowerCase()) {
      return `@${username} ❌ Impossible de timeout le diffuseur.`;
    }

    if (targetUser === config.twitch.botUsername.toLowerCase()) {
      return `@${username} ❌ Impossible de timeout le bot.`;
    }

    try {
      // Timeout the user (duration in seconds)
      await client.timeout(channel, targetUser, duration * 60, reason);
      return `@${username} ✅ ${targetUser} a été mis en timeout pour ${duration} minute(s). Raison: ${reason}`;
    } catch (error) {
      console.error("Timeout error:", error);
      return `@${username} ❌ Erreur lors du timeout: ${error.message}`;
    }
  },
};
