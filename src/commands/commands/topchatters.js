/**
 * Shows the top 10 most active chatters of the current stream session
 */
export default {
  name: "topchatters",
  description: "Affiche les 10 utilisateurs les plus actifs du stream actuel",
  aliases: ["topactive", "active"],
  cooldown: 10,
  ownerOnly: false,

  async execute(client, channel, userstate, args, config) {
    const username = userstate["display-name"];

    // Get the chat client from the global context
    // We need to pass it through the command handler
    if (!this.chatClient) {
      return `@${username} Erreur: impossible d'accéder aux statistiques.`;
    }

    const topChatters = this.chatClient.getTopChatters(10);

    if (topChatters.length === 0) {
      return `@${username} Aucun message n'a été envoyé depuis le début du stream.`;
    }

    // Format the response
    const topList = topChatters
      .map(
        (chatter, index) =>
          `${index + 1}. ${chatter.username} (${chatter.count})`
      )
      .join(" | ");

    return `@${username} Top 10 chatteurs: ${topList}`;
  },
};
