import db from "../../../database/db.js";

/**
 * Toggle scheduled message on/off - Owner only
 */
export default {
  name: "toggleschedule",
  aliases: ["toggle"],
  description: "Active/désactive un message planifié (Owner)",
  cooldown: 3,
  ownerOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    if (args.length === 0) {
      return `@${username} Usage: !toggleschedule <id>. Ex: !toggleschedule 1`;
    }

    const id = parseInt(args[0]);
    if (isNaN(id)) {
      return `@${username} L'ID doit être un nombre.`;
    }

    try {
      const msg = db
        .prepare("SELECT * FROM scheduled_messages WHERE id = ?")
        .get(id);

      if (!msg) {
        return `@${username} ❌ Message planifié #${id} introuvable.`;
      }

      const newStatus = msg.enabled === 1 ? 0 : 1;
      db.prepare("UPDATE scheduled_messages SET enabled = ? WHERE id = ?").run(
        newStatus,
        id
      );

      const status = newStatus === 1 ? "activé ✅" : "désactivé ❌";
      return `@${username} Message planifié #${id} ${status}. Redémarre le bot pour appliquer.`;
    } catch (error) {
      return `@${username} ❌ Erreur: ${error.message}`;
    }
  },
};
