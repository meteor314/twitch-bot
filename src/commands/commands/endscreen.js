import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getTopUsers } from "../../../database/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Exports top chatters and top viewers data to JSON file for the end screen
 */
export default {
  name: "endscreen",
  description: "Exporte les données pour l'écran de fin (Mod/Owner uniquement)",
  aliases: ["exportchatters", "saveendscreen", "end"],
  cooldown: 5,
  ownerOnly: false,
  modOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    // Get the chat client from the global context
    if (!this.chatClient) {
      return `@${username} Erreur: impossible d'accéder aux statistiques.`;
    }

    try {
      const topChatters = this.chatClient.getTopChatters(10);

      // Get top viewers by points, excluding the owner
      const ownerUsername = config.bot.owner?.toLowerCase();
      let topViewers = getTopUsers(15); // Get 15 to ensure we have 10 after filtering

      // Filter out the owner
      topViewers = topViewers
        .filter((viewer) => viewer.username.toLowerCase() !== ownerUsername)
        .slice(0, 10); // Take only top 10 after filtering

      // Prepare data for export
      const exportData = {
        exportDate: new Date().toISOString(),
        streamDate: new Date().toLocaleDateString("fr-FR"),
        totalChatters: topChatters.length,
        chatters: topChatters.map((chatter, index) => ({
          rank: index + 1,
          username: chatter.username,
          count: chatter.count,
        })),
        totalViewers: topViewers.length,
        viewers: topViewers.map((viewer, index) => ({
          rank: index + 1,
          username: viewer.username,
          points: viewer.points,
          watchTime: viewer.watch_time,
        })),
      };

      // Save to public folder
      const publicPath = path.join(__dirname, "../../../public");

      // Create public directory if it doesn't exist
      if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
      }

      const filePath = path.join(publicPath, "topchatters.json");
      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

      return `@${username} Données exportées! ${topChatters.length} chatteurs sauvegardés. Fichier: public/topchatters.json`;
    } catch (error) {
      console.error("Error exporting end screen data:", error);
      return `@${username} Erreur lors de l'export: ${error.message}`;
    }
  },
};
