import db from "../../../database/db.js";

/**
 * Redirects users to the GitHub commands list
 */
export default {
  name: "commands",
  description: "Affiche le lien vers la liste complète des commandes",
  aliases: ["commandes", "help", "aide"],
  cooldown: 30,
  ownerOnly: false,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    // Get command count
    const customCommands = db
      .prepare("SELECT COUNT(*) as count FROM custom_commands")
      .get();

    const totalCommands = customCommands.count + 15; // Approximate hardcoded commands count

    return `@${username} 📋 Liste complète des commandes (${totalCommands}): https://github.com/meteor314/twitch-bot/blob/master/exports/COMMANDS_LIST_FR.md | EN: https://github.com/meteor314/twitch-bot/blob/master/exports/COMMANDS_LIST_EN.md`;
  },
};
