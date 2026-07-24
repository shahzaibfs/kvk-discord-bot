const {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  MessageFlags,
} = require("discord.js");

const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const RallyLeaderService = require("../../service/kvk-rallies");

const ACTIONS = {
  RESET: "reset",
  REMOVE: "remove",
};

module.exports = new ApplicationCommand({
  command: {
    name: "remove-or-reset-all-rally",
    description: "Remove a rally leader or reset all registered rally leaders.",
    type: 1,
    options: [
      {
        name: "type",
        description: "Choose the action to perform.",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          {
            name: "Reset All Rally Leaders",
            value: ACTIONS.RESET,
          },
          {
            name: "Remove Rally Leader",
            value: ACTIONS.REMOVE,
          },
        ],
      },
      {
        name: "rally-leader-name",
        description: "Exact in-game name of the rally leader.",
        type: ApplicationCommandOptionType.String,
        required: false,
        autocomplete: true,
      },
    ],
  },

  options: {
    cooldown: 5000,
  },

  /**
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const action = interaction.options.getString("type", true);
    const leaderName = interaction.options.getString("rally-leader-name");

    try {
      switch (action) {
        case ACTIONS.REMOVE: {
          if (!leaderName) {
            return interaction.reply({
              flags: MessageFlags.Ephemeral,
              content: "❌ Please provide the rally leader name to remove.",
            });
          }

          const deleted = await RallyLeaderService.remove(
            interaction.guildId,
            leaderName,
          );

          if (!deleted) {
            return interaction.reply({
              flags: MessageFlags.Ephemeral,
              content: `⚠️ Rally leader **${leaderName}** was not found.`,
            });
          }

          return interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: `✅ Successfully removed **${leaderName}**.`,
          });
        }

        case ACTIONS.RESET: {
          await RallyLeaderService.reset(interaction.guildId);

          return interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: "✅ All rally leaders have been reset.",
          });
        }

        default:
          return interaction.reply({
            flags: MessageFlags.Ephemeral,
            content: "❌ Unknown action.",
          });
      }
    } catch (err) {
      console.error(err);

      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: "❌ An unexpected error occurred. Please try again.",
      });
    }
  },
}).toJSON();
