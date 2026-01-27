import axios from "axios";
import config from "../../config/config.js";
import { getAppAccessToken } from "../../auth/auth.js";

/**
 * Creates a clip of the last 30 seconds
 */
export default {
  name: "clip",
  description: "Crée un clip des 30 dernières secondes",
  cooldown: 30,
  ownerOnly: false,
  modOnly: true,
  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    try {
      // Get the broadcaster ID first
      const broadcasterUsername = config.twitch.channel.replace("#", "");

      // Get app access token for API calls
      const tokenResult = await getAppAccessToken();

      if (!tokenResult.success) {
        return `@${username} Erreur lors de l'authentification avec Twitch.`;
      }

      // Get broadcaster ID
      const userResponse = await axios.get(
        `https://api.twitch.tv/helix/users?login=${broadcasterUsername}`,
        {
          headers: {
            "Client-ID": config.twitch.clientId,
            Authorization: `Bearer ${tokenResult.token}`,
          },
        },
      );

      if (!userResponse.data.data || userResponse.data.data.length === 0) {
        return `@${username} Impossible de trouver le streamer.`;
      }

      const broadcasterId = userResponse.data.data[0].id;

      // Check if the stream is live
      const streamResponse = await axios.get(
        `https://api.twitch.tv/helix/streams?user_id=${broadcasterId}`,
        {
          headers: {
            "Client-ID": config.twitch.clientId,
            Authorization: `Bearer ${tokenResult.token}`,
          },
        },
      );

      if (!streamResponse.data.data || streamResponse.data.data.length === 0) {
        return `@${username} Le stream doit être en ligne pour créer un clip.`;
      }

      // Create the clip
      const clipResponse = await axios.post(
        `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}`,
        {},
        {
          headers: {
            "Client-ID": config.twitch.clientId,
            Authorization: `Bearer ${tokenResult.token}`,
          },
        },
      );

      if (clipResponse.data.data && clipResponse.data.data.length > 0) {
        const clipData = clipResponse.data.data[0];
        const clipUrl = `https://clips.twitch.tv/${clipData.id}`;

        return `@${username} Clip créé avec succès! ${clipUrl}`;
      } else {
        return `@${username} Erreur lors de la création du clip.`;
      }
    } catch (error) {
      console.error("Error creating clip:", error);

      if (error.response?.status === 401) {
        return `@${username} Erreur d'authentification. Le bot n'a pas les permissions nécessaires.`;
      } else if (error.response?.status === 503) {
        return `@${username} Service Twitch temporairement indisponible.`;
      } else {
        return `@${username} Erreur lors de la création du clip: ${error.message}`;
      }
    }
  },
};
