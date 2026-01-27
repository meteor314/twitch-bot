import { updateCustomCommand, getCustomCommand } from "../../../database/db.js";

/**
 * Edit custom command - Mod/Owner only
 */
export default {
  name: "edit",
  description: "Modifie une commande personnalisée (Mod/Owner uniquement)",
  cooldown: 3,
  ownerOnly: false,
  modOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    // Check if command name and new response are provided
    if (args.length < 2) {
      return `@${username} Usage: !edit <nom_commande> <nouvelle_réponse>`;
    }

    const commandName = args[0].toLowerCase().replace(/^!/, ""); // Remove ! if present
    const newResponse = args.slice(1).join(" ");

    // Check if command exists
    const existingCommand = getCustomCommand(commandName);
    if (!existingCommand) {
      return `@${username} La commande !${commandName} n'existe pas. Utilise !add pour la créer.`;
    }

    // Update in database
    const result = updateCustomCommand(commandName, newResponse);

    if (result.success) {
      return `✅ Commande !${commandName} modifiée avec succès !`;
    } else {
      return `❌ Erreur: ${result.error}`;
    }
  },
};
