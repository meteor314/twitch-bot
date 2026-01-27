import db, { getScheduledMessages } from "../../../database/db.js";

/**
 * List all scheduled messages - Mod/Owner only
 */
export default {
  name: "schedules",
  aliases: ["messages", "automsgs"],
  description: "Liste tous les messages planifiés (Mod/Owner)",
  cooldown: 5,
  modOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    try {
      const messages = getScheduledMessages();

      if (messages.length === 0) {
        return `@${username} Aucun message planifié configuré.`;
      }

      const list = messages
        .map((msg) => {
          const status = msg.enabled ? "✅" : "❌";
          const preview =
            msg.message.length > 30
              ? msg.message.substring(0, 30) + "..."
              : msg.message;
          return `${status} #${msg.id} (${msg.interval_minutes}min): "${preview}"`;
        })
        .join(" | ");

      return `@${username} Messages planifiés: ${list}`;
    } catch (error) {
      return `@${username} ❌ Erreur: ${error.message}`;
    }
  },
};
