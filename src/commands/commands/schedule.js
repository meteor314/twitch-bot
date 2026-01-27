import { addScheduledMessage } from "../../../database/db.js";

/**
 * Add scheduled message - Owner only
 */
export default {
  name: "schedule",
  description: "Ajoute un message planifié (Owner uniquement)",
  cooldown: 5,
  ownerOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    // Usage: !schedule <minutes> <message>
    if (args.length < 2) {
      return `@${username} Usage: !schedule <minutes> <message>. Ex: !schedule 30 N'oublie pas de follow !`;
    }

    const minutes = parseInt(args[0]);
    if (isNaN(minutes) || minutes < 1) {
      return `@${username} Le nombre de minutes doit être un nombre positif.`;
    }

    const message = args.slice(1).join(" ");

    try {
      addScheduledMessage(message, minutes);
      return `@${username} ✅ Message planifié ajouté (toutes les ${minutes}min). Redémarre le bot pour l'activer.`;
    } catch (error) {
      return `@${username} ❌ Erreur: ${error.message}`;
    }
  },
};
