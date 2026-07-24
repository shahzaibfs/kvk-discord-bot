const {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  MessageFlags,
} = require("discord.js");

const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const RallyLeaderService = require("../../service/kvk-rallies");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

module.exports = new ApplicationCommand({
  command: {
    name: "rally-list",
    description: "All Rallies",
    type: 1,
    options: [],
  },

  options: {
    cooldown: 5000,
  },

  /**
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const rLeaders = await RallyLeaderService.getAll(interaction.guildId);

    const rows = Object.values(rLeaders)
      .sort((a, b) => a.marchTime - b.marchTime)
      .map((leader) => {
        let name = leader.name.padEnd(20);

        const march = `[${leader.marchTime.toFixed(0)}s]`;

        return `${name} [${leader.marchTime.toFixed(0)}s]`;
      });

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: ["```", "⚔ Rally Leaders", ...rows, "```"].join("\n"),
    });
  },
}).toJSON();
