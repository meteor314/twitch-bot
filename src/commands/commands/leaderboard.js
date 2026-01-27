import { getTopUsers } from "../../../database/db.js";

/**
 * Leaderboard command - Show top users
 */
export default {
  name: "leaderboard",
  description: "Affiche le classement des meilleurs viewers",
  aliases: ["top", "classement"],
  cooldown: 30,
  ownerOnly: false,

  async execute(client, channel, userstate, args, config) {
    const topUsers = getTopUsers(5);

    if (!topUsers || topUsers.length === 0) {
      return `Aucun point n'a encore été attribué !`;
    }

    const leaderboard = topUsers
      .map((user, index) => {
        const medal =
          index === 0
            ? "🥇"
            : index === 1
            ? "🥈"
            : index === 2
            ? "🥉"
            : `${index + 1}.`;
        return `${medal} ${user.username}: ${user.points} pts`;
      })
      .join(" | ");

    return `🏆 Top Viewers: ${leaderboard}`;
  },
};
