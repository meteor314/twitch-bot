import { getUserPoints, getTopUsers } from "../../../database/db.js";

/**
 * Rank command - Show user points and rank
 */
export default {
  name: "rank",
  description: "Affiche tes points et ton rang",
  aliases: ["points", "score"],
  cooldown: 10,
  ownerOnly: false,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];
    const userId = userstate["user-id"];

    // If checking another user's rank
    if (args.length > 0) {
      const targetUser = args[0].replace("@", "");
      return `@${username} Utilise !leaderboard pour voir le classement.`;
    }

    // Get user's points
    const userData = getUserPoints(userId);

    if (!userData || userData.points === 0) {
      return `@${username} Tu n'as pas encore de points. Reste connecté pour gagner des points ! 💜`;
    }

    const hours = Math.floor(userData.watch_time / 60);
    const minutes = userData.watch_time % 60;

    return `@${username} Tu as ${userData.points} points 💎 | Temps de visionnage: ${hours}h${minutes}m ⏱️`;
  },
};
