/**
 * Ban a user from chat - Mod only
 */
export default {
  name: "ban",
  description: "Bannir un utilisateur du chat (Mod uniquement)",
  usage: "!ban @username [reason]",
  cooldown: 3,
  ownerOnly: false,
  modOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    // Check if username is provided
    if (args.length < 1) {
      return `@${username} Usage: !ban @username [reason]`;
    }

    // Extract username (remove @ if present)
    const targetUser = args[0].replace(/^@/, "").toLowerCase();
    const reason = args.slice(1).join(" ") || "No reason provided";

    // Prevent banning broadcaster or bot
    if (targetUser === config.twitch.channel.toLowerCase()) {
      return `@${username} ❌ Impossible de bannir le diffuseur.`;
    }

    if (targetUser === config.twitch.botUsername.toLowerCase()) {
      return `@${username} ❌ Impossible de bannir le bot.`;
    }

    try {
      // Ban the user
      await client.ban(channel, targetUser, reason);
      return `@${username} ✅ ${targetUser} a été banni. Raison: ${reason}`;
    } catch (error) {
      console.error("Ban error:", error);
      return `@${username} ❌ Erreur lors du bannissement: ${error.message}`;
    }
  },
};
