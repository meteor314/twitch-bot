import { getAllCustomCommands } from "../../../database/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get all hardcoded commands from the handler
 */
function getAllHardcodedCommands() {
  const commandsPath = path.join(__dirname);
  const commands = [];

  try {
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js") && file !== "export.js");

    for (const file of commandFiles) {
      try {
        const commandPath = path.join(commandsPath, file);
        const commandContent = fs.readFileSync(commandPath, "utf-8");

        // Extract command properties from export default
        const nameMatch = commandContent.match(/name:\s*["']([^"']+)["']/);
        const descMatch = commandContent.match(
          /description:\s*["']([^"']+)["']/,
        );
        const usageMatch = commandContent.match(/usage:\s*["']([^"']+)["']/);
        const aliasesMatch = commandContent.match(/aliases:\s*\[(.*?)\]/);
        const ownerOnlyMatch = commandContent.match(
          /ownerOnly:\s*(true|false)/,
        );
        const modOnlyMatch = commandContent.match(/modOnly:\s*(true|false)/);

        if (nameMatch) {
          const ownerOnly =
            ownerOnlyMatch ? ownerOnlyMatch[1] === "true" : false;
          const modOnly = modOnlyMatch ? modOnlyMatch[1] === "true" : false;

          let access = "Everyone";
          if (ownerOnly) access = "Owner";
          else if (modOnly) access = "Mod/Owner";

          let aliases = [];
          if (aliasesMatch) {
            aliases = aliasesMatch[1]
              .split(",")
              .map((a) => a.trim().replace(/["']/g, ""))
              .filter((a) => a);
          }

          commands.push({
            name: nameMatch[1],
            description: descMatch ? descMatch[1] : "No description",
            usage: usageMatch ? usageMatch[1] : `!${nameMatch[1]}`,
            access: access,
            aliases: aliases,
            type: "hardcoded",
          });
        }
      } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Error scanning commands:", error.message);
  }

  return commands;
}

/**
 * Export commands to JSON - Owner only
 */
export default {
  name: "export",
  description: "Exporte toutes les commandes en JSON (Owner uniquement)",
  cooldown: 60,
  ownerOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    try {
      // Get all custom commands from database
      const customCommands = getAllCustomCommands();

      // Get all hardcoded commands
      const hardcodedCommands = getAllHardcodedCommands();

      const exportData = {
        exported_at: new Date().toISOString(),
        bot_name: config.twitch.botUsername,
        channel: config.twitch.channel,
        total_commands: customCommands.length + hardcodedCommands.length,
        hardcoded_commands: hardcodedCommands,
        custom_commands: customCommands.map((cmd) => ({
          name: cmd.name,
          response: cmd.response,
          created_by: cmd.created_by,
          use_count: cmd.use_count,
          created_at: cmd.created_at,
        })),
      };

      // Prepare export directory
      const exportDir = path.join(__dirname, "../../../exports");
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Remove all old JSON files and old COMMANDS_LIST.md
      const existingFiles = fs.readdirSync(exportDir);
      existingFiles.forEach((file) => {
        if (file.endsWith(".json") || file === "COMMANDS_LIST.md") {
          fs.unlinkSync(path.join(exportDir, file));
        }
      });

      // Save new JSON export
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `commands_export_${timestamp}.json`;
      const filepath = path.join(exportDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), "utf-8");

      // Generate markdown files in both languages
      const mdContentFR = generateMarkdownFR(exportData, filename);
      const mdContentEN = generateMarkdownEN(exportData, filename);

      const mdFilepathFR = path.join(exportDir, "COMMANDS_LIST_FR.md");
      const mdFilepathEN = path.join(exportDir, "COMMANDS_LIST_EN.md");

      fs.writeFileSync(mdFilepathFR, mdContentFR, "utf-8");
      fs.writeFileSync(mdFilepathEN, mdContentEN, "utf-8");

      return `@${username} ✅ ${exportData.total_commands} commande(s) exportée(s) vers: exports/${filename} + COMMANDS_LIST_FR.md + COMMANDS_LIST_EN.md`;
    } catch (error) {
      console.error("Export error:", error);
      return `@${username} ❌ Erreur lors de l'export: ${error.message}`;
    }
  },
};

/**
 * Generate French markdown documentation from export data
 */
function generateMarkdownFR(exportData, jsonFilename) {
  const {
    exported_at,
    bot_name,
    channel,
    hardcoded_commands,
    custom_commands,
  } = exportData;

  let md = `# Liste des Commandes\n\n`;
  md += `**Bot:** ${bot_name}  \n`;
  md += `**Canal:** ${channel}  \n`;
  md += `**Exporté:** ${new Date(exported_at).toLocaleString("fr-FR")}  \n`;
  md += `**Total Commandes:** ${exportData.total_commands}  \n`;
  md += `**Export JSON:** ${jsonFilename}\n\n`;
  md += `---\n\n`;

  // Hardcoded Commands Section
  md += `## 🔧 Commandes Intégrées (${hardcoded_commands.length})\n\n`;
  md += `Ce sont des **commandes intégrées** qui font partie des fonctionnalités principales du bot. Elles ne peuvent pas être modifiées ou supprimées via les commandes du chat.\n\n`;

  if (hardcoded_commands.length > 0) {
    md += `| Commande | Description | Utilisation | Accès | Alias |\n`;
    md += `|----------|-------------|-------------|-------|-------|\n`;

    hardcoded_commands.forEach((cmd) => {
      const description =
        cmd.description.length > 60 ?
          cmd.description.substring(0, 57) + "..."
        : cmd.description;
      const aliases =
        cmd.aliases.length > 0 ?
          cmd.aliases.map((a) => `!${a}`).join(", ")
        : "-";
      const accessFR =
        cmd.access === "Owner" ? "Propriétaire"
        : cmd.access === "Mod/Owner" ? "Mod/Propriétaire"
        : "Tous";
      md += `| !${cmd.name} | ${description} | \`${cmd.usage}\` | ${accessFR} | ${aliases} |\n`;
    });

    md += `\n`;
  } else {
    md += `*Aucune commande intégrée trouvée.*\n\n`;
  }

  md += `---\n\n`;

  // Custom Commands Section
  md += `## 💬 Commandes Personnalisées (${custom_commands.length})\n\n`;
  md += `Ce sont des **commandes créées par les utilisateurs** stockées dans la base de données. Elles peuvent être ajoutées, modifiées ou supprimées par les modérateurs et le propriétaire du bot.\n\n`;
  md += `### Comment gérer les commandes personnalisées:\n`;
  md += `- **Ajouter:** \`!add <nom_commande> <réponse>\`\n`;
  md += `- **Modifier:** \`!edit <nom_commande> <nouvelle_réponse>\`\n`;
  md += `- **Supprimer:** \`!remove <nom_commande>\`\n`;
  md += `- **Lister:** \`!commands\` ou \`!commandes\`\n\n`;

  if (custom_commands.length > 0) {
    md += `| Commande | Réponse | Créée par | Utilisations | Créée le |\n`;
    md += `|----------|---------|-----------|--------------|----------|\n`;

    custom_commands.forEach((cmd) => {
      const response =
        cmd.response.length > 50 ?
          cmd.response.substring(0, 47) + "..."
        : cmd.response;
      const createdAt =
        cmd.created_at ?
          new Date(cmd.created_at).toLocaleDateString("fr-FR")
        : "Inconnu";
      md += `| !${cmd.name} | ${response} | ${cmd.created_by} | ${cmd.use_count} | ${createdAt} |\n`;
    });

    md += `\n`;
  } else {
    md += `*Aucune commande personnalisée trouvée.*\n\n`;
  }

  // Footer
  md += `---\n\n`;
  md += `*Ce fichier est généré automatiquement lors de l'exécution de \`!export\`. Ne pas modifier manuellement.*\n`;

  return md;
}

/**
 * Generate English markdown documentation from export data
 */
function generateMarkdownEN(exportData, jsonFilename) {
  const {
    exported_at,
    bot_name,
    channel,
    hardcoded_commands,
    custom_commands,
  } = exportData;

  let md = `# Commands List\n\n`;
  md += `**Bot:** ${bot_name}  \n`;
  md += `**Channel:** ${channel}  \n`;
  md += `**Exported:** ${new Date(exported_at).toLocaleString("en-US")}  \n`;
  md += `**Total Commands:** ${exportData.total_commands}  \n`;
  md += `**JSON Export:** ${jsonFilename}\n\n`;
  md += `---\n\n`;

  // Hardcoded Commands Section
  md += `## 🔧 Hardcoded Commands (${hardcoded_commands.length})\n\n`;
  md += `These are **built-in commands** that are part of the bot's core functionality. They cannot be modified or deleted through chat commands.\n\n`;

  if (hardcoded_commands.length > 0) {
    md += `| Command | Description | Usage | Access | Aliases |\n`;
    md += `|---------|-------------|-------|--------|----------|\n`;

    hardcoded_commands.forEach((cmd) => {
      const description =
        cmd.description.length > 60 ?
          cmd.description.substring(0, 57) + "..."
        : cmd.description;
      const aliases =
        cmd.aliases.length > 0 ?
          cmd.aliases.map((a) => `!${a}`).join(", ")
        : "-";
      md += `| !${cmd.name} | ${description} | \`${cmd.usage}\` | ${cmd.access} | ${aliases} |\n`;
    });

    md += `\n`;
  } else {
    md += `*No hardcoded commands found.*\n\n`;
  }

  md += `---\n\n`;

  // Custom Commands Section
  md += `## 💬 Custom Commands (${custom_commands.length})\n\n`;
  md += `These are **user-created commands** stored in the database. They can be added, edited, or removed by moderators and the bot owner.\n\n`;
  md += `### How to manage custom commands:\n`;
  md += `- **Add:** \`!add <command_name> <response>\`\n`;
  md += `- **Edit:** \`!edit <command_name> <new_response>\`\n`;
  md += `- **Remove:** \`!remove <command_name>\`\n`;
  md += `- **List:** \`!commands\` or \`!commandes\`\n\n`;

  if (custom_commands.length > 0) {
    md += `| Command | Response | Created By | Uses | Created |\n`;
    md += `|---------|----------|------------|------|----------|\n`;

    custom_commands.forEach((cmd) => {
      const response =
        cmd.response.length > 50 ?
          cmd.response.substring(0, 47) + "..."
        : cmd.response;
      const createdAt =
        cmd.created_at ?
          new Date(cmd.created_at).toLocaleDateString("en-US")
        : "Unknown";
      md += `| !${cmd.name} | ${response} | ${cmd.created_by} | ${cmd.use_count} | ${createdAt} |\n`;
    });

    md += `\n`;
  } else {
    md += `*No custom commands found.*\n\n`;
  }

  // Footer
  md += `---\n\n`;
  md += `*This file is automatically generated when running \`!export\`. Do not edit manually.*\n`;

  return md;
}
