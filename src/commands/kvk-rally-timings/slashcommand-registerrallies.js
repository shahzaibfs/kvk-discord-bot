const {
  ApplicationCommandOptionType,
  MessageFlags,
  ChatInputCommandInteraction,
} = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const RallyLeaderService = require("../../service/kvk-rallies");

module.exports = new ApplicationCommand({
  command: {
    name: "register-leader",
    description: "Register a rally leader and their march time.",
    type: 1,
    options: [
      {
        name: "name",
        description: "In-game name of the rally leader.",
        type: ApplicationCommandOptionType.String,
        required: true,
        max_length: 25,
      },
      {
        name: "march-time",
        description: "March time in seconds (e.g. 19.4).",
        type: ApplicationCommandOptionType.Number,
        required: true,
        min_value: 0,
        max_value: 59.99,
      },
    ],
  },

  options: {
    cooldown: 0,
  },

  /**
   * @param {DiscordBot} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const rLeader = {
      name: interaction.options.getString("name").trim(),
      marchTime: interaction.options.getNumber("march-time"),
    };

    try {
      await RallyLeaderService.save(interaction.guildId, rLeader);

      const rLeaders = await RallyLeaderService.getAll(interaction.guildId);

      const leaders = Object.values(rLeaders)
        .sort((a, b) => a.marchTime - b.marchTime)
        .map((leader) => {
          const name = leader.name.padEnd(20);
          const march = `[${leader.marchTime.toFixed(1)}s]`;

          return `${name} ${march}`;
        })
        .join("\n");

      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: [
          "```",
          "⚔ REGISTERED RALLY LEADERS",
          "",
          "Leader               March",
          "──────────────────────────────",
          leaders || "No rally leaders registered.",
          "──────────────────────────────",
          `Total Leaders : ${Object.keys(rLeaders).length}`,
          "```",
        ].join("\n"),
      });
    } catch (err) {
      console.error(err);

      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "❌ Failed to register the rally leader. Please try again later.",
      });
    }
  },
}).toJSON();
