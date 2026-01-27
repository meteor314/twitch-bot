import { addCustomCommand } from "../../../database/db.js";

/**
 * Add custom command - Mod/Owner only
 */
export default {
  name: "add",
  description: "Ajoute une commande personnalisée (Mod/Owner uniquement)",
  cooldown: 3,
  ownerOnly: false,
  modOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    // Check if command name and response are provided
    if (args.length < 2) {
      return `@${username} Usage: !add <nom_commande> <réponse>`;
    }

    const commandName = args[0].toLowerCase().replace(/^!/, ""); // Remove ! if present
    const response = args.slice(1).join(" ");

    // Prevent overriding hardcoded commands
    const reservedCommands = [
      "commands",
      "commandes",
      "help",
      "aide",
      "title",
      "add",
      "edit",
      "remove",
      "delete",
      "del",
      "export",
      "rank",
      "points",
    ];

    if (reservedCommands.includes(commandName)) {
      return `@${username} Impossible de créer une commande avec ce nom (commande système).`;
    }

    // Add to database
    const result = addCustomCommand(commandName, response, userstate.username);

    if (result.success) {
      return `✅ Commande !${commandName} créée avec succès !`;
    } else {
      return `❌ Erreur: ${result.error}`;
    }
  },
};
