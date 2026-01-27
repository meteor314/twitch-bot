import { removeCustomCommand, getCustomCommand } from "../../../database/db.js";

/**
 * Remove custom command - Mod/Owner only
 */
export default {
  name: "remove",
  description: "Supprime une commande personnalisée (Mod/Owner uniquement)",
  aliases: ["delete", "del"],
  cooldown: 3,
  ownerOnly: false,
  modOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    // Check if command name is provided
    if (args.length < 1) {
      return `@${username} Usage: !remove <nom_commande>`;
    }

    const commandName = args[0].toLowerCase().replace(/^!/, ""); // Remove ! if present

    // Check if command exists
    const existingCommand = getCustomCommand(commandName);
    if (!existingCommand) {
      return `@${username} La commande !${commandName} n'existe pas.`;
    }

    // Remove from database
    const result = removeCustomCommand(commandName);

    if (result.success) {
      return `✅ Commande !${commandName} supprimée avec succès !`;
    } else {
      return `❌ Erreur: ${result.error}`;
    }
  },
};
