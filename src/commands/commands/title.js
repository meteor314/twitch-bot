import axios from "axios";

/**
 * Title command - Change stream title (Mod/Owner only)
 */
export default {
  name: "title",
  description: "Change le titre du stream (Mod/Propriétaire uniquement)",
  cooldown: 10,
  ownerOnly: false,
  modOnly: true,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    // Check if user is mod or owner
    const isMod =
      userstate.mod ||
      userstate.username === config.twitch.channel.toLowerCase();
    const isOwner = userstate.username === config.bot.owner?.toLowerCase();

    if (!isMod && !isOwner) {
      return `@${username} Cette commande est réservée aux modérateurs et au propriétaire.`;
    }

    // Check if title was provided
    if (args.length === 0) {
      return `@${username} Usage: !title <nouveau titre>`;
    }

    const newTitle = args.join(" ");

    try {
      // Get app access token
      const tokenResponse = await axios.post(
        "https://id.twitch.tv/oauth2/token",
        null,
        {
          params: {
            client_id: config.twitch.clientId,
            client_secret: config.twitch.clientSecret,
            grant_type: "client_credentials",
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Get broadcaster's user ID
      const userResponse = await axios.get(
        "https://api.twitch.tv/helix/users",
        {
          params: {
            login: config.twitch.channel,
          },
          headers: {
            "Client-ID": config.twitch.clientId,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!userResponse.data.data || userResponse.data.data.length === 0) {
        return `Erreur : impossible de trouver la chaîne.`;
      }

      const broadcasterId = userResponse.data.data[0].id;

      // Update channel information
      await axios.patch(
        `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`,
        {
          title: newTitle,
        },
        {
          headers: {
            "Client-ID": config.twitch.clientId,
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return `✅ Titre du stream mis à jour : "${newTitle}"`;
    } catch (error) {
      console.error("Error updating title:", error.message);
      return `❌ Erreur lors de la mise à jour du titre. Vérifie les permissions de l'application.`;
    }
  },
};
