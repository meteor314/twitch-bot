import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { log, logCommand } from "../utils/logger.js";
import CooldownManager from "../utils/cooldown.js";
import {
  getCustomCommand,
  incrementUseCount,
  getCommandAlias,
} from "../../database/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.cooldownManager = new CooldownManager();
    this.chatClient = null; // Reference to chat client for commands that need it
    this.loadCommands();
  }

  /**
   * Sets the chat client reference for commands that need access to it
   */
  setChatClient(chatClient) {
    this.chatClient = chatClient;
  }

  /**
   * Loads all command files from the commands directory
   */
  async loadCommands() {
    const commandsPath = path.join(__dirname, "commands");

    try {
      // Check if commands directory exists
      if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        log("info", "📁 Created commands directory");
        return;
      }

      const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        try {
          const filePath = path.join(commandsPath, file);
          const command = await import(`file://${filePath}`);
          const commandData = command.default;

          if (commandData.name) {
            this.commands.set(commandData.name, commandData);

            // Register aliases if they exist
            if (commandData.aliases && Array.isArray(commandData.aliases)) {
              for (const alias of commandData.aliases) {
                this.commands.set(alias, commandData);
              }
            }

            log("info", `✅ Loaded command: ${commandData.name}`);
          }
        } catch (error) {
          log("error", `Failed to load command ${file}: ${error.message}`);
        }
      }

      log("success", `📦 Loaded ${this.commands.size} command(s)`);
    } catch (error) {
      log("error", `Error loading commands: ${error.message}`);
    }
  }

  /**
   * Handles incoming command messages
   */
  async handleCommand(client, channel, userstate, message, config) {
    // Parse command and arguments
    const args = message.slice(config.bot.prefix.length).trim().split(/\s+/);
    let commandName = args.shift().toLowerCase();

    // First, check hardcoded commands
    let command = this.commands.get(commandName);
    let isCustomCommand = false;

    // If not found, check for command alias
    if (!command) {
      const alias = getCommandAlias(commandName);
      if (alias) {
        commandName = alias.target_command;
        command = this.commands.get(commandName);
      }
    }

    // If still not found, check custom commands in database
    if (!command) {
      const customCmd = getCustomCommand(commandName);
      if (customCmd) {
        isCustomCommand = true;
        command = {
          name: customCmd.name,
          response: customCmd.response,
          cooldown: 5, // Default cooldown for custom commands
          ownerOnly: false,
          modOnly: false,
          execute: async () => customCmd.response,
        };
      }
    }

    if (!command) {
      return; // Command not found, ignore silently
    }

    // Check if command is owner-only
    if (command.ownerOnly && userstate.username !== config.bot.owner) {
      await client.say(
        channel,
        `@${userstate.username} Cette commande est réservée au propriétaire du bot.`,
      );
      return;
    }

    // Check if command is mod-only
    if (command.modOnly) {
      const isMod =
        userstate.mod ||
        userstate.username === config.twitch.channel.toLowerCase();
      const isOwner = userstate.username === config.bot.owner?.toLowerCase();

      if (!isMod && !isOwner) {
        await client.say(
          channel,
          `@${userstate.username} Cette commande est réservée aux modérateurs.`,
        );
        return;
      }
    }

    // Check if user is on cooldown
    if (command.cooldown) {
      const cooldownCheck = this.cooldownManager.isOnCooldown(
        userstate["user-id"],
        commandName,
        command.cooldown,
      );

      if (cooldownCheck.onCooldown) {
        await client.say(
          channel,
          `@${userstate.username} Merci d'attendre ${cooldownCheck.timeLeft} seconde(s) avant de réutiliser cette commande.`,
        );
        return;
      }
    }

    // Execute the command
    try {
      logCommand(channel, userstate["display-name"], commandName);

      // Pass chatClient reference to commands that need it
      if (command.chatClient === undefined && this.chatClient) {
        command.chatClient = this.chatClient;
      }

      const response = await command.execute(
        client,
        channel,
        userstate,
        args,
        config,
      );

      if (response) {
        await client.say(channel, response);
      }

      // Increment use count for custom commands
      if (isCustomCommand) {
        incrementUseCount(commandName);
      }

      // Set cooldown after successful execution
      if (command.cooldown) {
        this.cooldownManager.setCooldown(
          userstate["user-id"],
          commandName,
          command.cooldown,
        );
      }
    } catch (error) {
      log("error", `Error executing command ${commandName}: ${error.message}`);
      await client.say(
        channel,
        `@${userstate.username} Désolé, une erreur s'est produite lors de l'exécution de cette commande.`,
      );
    }
  }

  /**
   * Gets a list of all available commands
   */
  getCommands() {
    return Array.from(this.commands.values());
  }

  /**
   * Reloads all commands
   */
  async reloadCommands() {
    this.commands.clear();
    await this.loadCommands();
  }
}

export default CommandHandler;
