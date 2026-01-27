import db from "../../../database/db.js";

/**
 * Remove scheduled message - Owner only
 */
export default {
  name: "removeschedule",
  aliases: ["delschedule"],
  description: "Supprime un message planifié (Owner)",
  cooldown: 3,
  ownerOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    if (args.length === 0) {
      return `@${username} Usage: !removeschedule <id>. Ex: !removeschedule 1`;
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

      db.prepare("DELETE FROM scheduled_messages WHERE id = ?").run(id);

      return `@${username} ✅ Message planifié #${id} supprimé. Redémarre le bot pour appliquer.`;
    } catch (error) {
      return `@${username} ❌ Erreur: ${error.message}`;
    }
  },
};
