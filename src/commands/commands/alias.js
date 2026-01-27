import {
  addCommandAlias,
  getCommandAlias,
  getCustomCommand,
  removeCommandAlias,
  getAllCommandAliases,
} from "../../../database/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Check if a hardcoded command exists
 */
function hardcodedCommandExists(commandName) {
  const commandsPath = path.join(__dirname);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    try {
      const commandPath = path.join(commandsPath, file);
      const commandContent = fs.readFileSync(commandPath, "utf-8");
      const nameMatch = commandContent.match(/name:\s*["']([^"']+)["']/);

      if (
        nameMatch &&
        nameMatch[1].toLowerCase() === commandName.toLowerCase()
      ) {
        return true;
      }
    } catch (error) {
      // Continue checking other files
    }
  }

  return false;
}

/**
 * Check if a command exists (hardcoded or custom)
 */
function commandExists(commandName) {
  // Check hardcoded commands
  if (hardcodedCommandExists(commandName)) {
    return true;
  }

  // Check custom commands
  const customCmd = getCustomCommand(commandName);
  return !!customCmd;
}

/**
 * Alias command - Create command aliases (Mod/Owner only)
 */
export default {
  name: "alias",
  description:
    "Créer un alias pour une commande existante (Mod/Owner uniquement)",
  usage: "!alias <alias> <command> | !alias list | !alias remove <alias>",
  cooldown: 5,
  modOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    // Check if user is mod or owner
    const isMod =
      userstate.mod ||
      userstate.username === config.twitch.channel.toLowerCase();
    const isOwner = userstate.username === config.bot.owner?.toLowerCase();

    if (!isMod && !isOwner) {
      return `@${username} ❌ Cette commande est réservée aux modérateurs et au propriétaire.`;
    }

    // Show usage if no args
    if (args.length === 0) {
      return `@${username} Usage: !alias <alias> <command> | !alias list | !alias remove <alias>`;
    }

    const subcommand = args[0].toLowerCase();

    // List all aliases
    if (subcommand === "list") {
      try {
        const aliases = getAllCommandAliases();

        if (aliases.length === 0) {
          return `@${username} Aucun alias trouvé.`;
        }

        const aliasText = aliases
          .map((a) => `!${a.alias_name} → !${a.target_command}`)
          .join(", ");

        return `@${username} Aliases (${aliases.length}): ${aliasText}`;
      } catch (error) {
        console.error("Error listing aliases:", error);
        return `@${username} ❌ Erreur lors de la récupération des aliases.`;
      }
    }

    // Remove an alias
    if (subcommand === "remove" || subcommand === "delete") {
      if (args.length < 2) {
        return `@${username} Usage: !alias remove <alias>`;
      }

      const aliasName = args[1].toLowerCase();

      // Check if alias exists
      const existingAlias = getCommandAlias(aliasName);
      if (!existingAlias) {
        return `@${username} ❌ L'alias "${aliasName}" n'existe pas.`;
      }

      const result = removeCommandAlias(aliasName);
      if (result.success) {
        return `@${username} ✅ Alias "!${aliasName}" supprimé.`;
      } else {
        return `@${username} ❌ Erreur: ${result.error}`;
      }
    }

    // Create alias
    if (args.length < 2) {
      return `@${username} Usage: !alias <alias> <command>`;
    }

    const aliasName = args[0].toLowerCase();
    const targetCommand = args[1].toLowerCase();

    // Check if alias already exists
    const existingAlias = getCommandAlias(aliasName);
    if (existingAlias) {
      return `@${username} ❌ L'alias "${aliasName}" existe déjà et pointe vers !${existingAlias.target_command}`;
    }

    // Check if alias is already a command
    if (commandExists(aliasName)) {
      return `@${username} ❌ "${aliasName}" est déjà une commande existante.`;
    }

    // Check if target command exists
    if (!commandExists(targetCommand)) {
      return `@${username} ❌ La commande "${targetCommand}" n'existe pas.`;
    }

    // Create the alias
    try {
      const result = addCommandAlias(aliasName, targetCommand, username);

      if (result.success) {
        return `@${username} ✅ Alias créé: !${aliasName} → !${targetCommand}`;
      } else {
        return `@${username} ❌ Erreur: ${result.error}`;
      }
    } catch (error) {
      console.error("Error creating alias:", error);
      return `@${username} ❌ Erreur lors de la création de l'alias: ${error.message}`;
    }
  },
};
