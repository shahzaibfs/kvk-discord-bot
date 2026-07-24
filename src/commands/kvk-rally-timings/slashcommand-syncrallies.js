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
    name: "get-sync-time",
    description: "Calculate when each rally leader should start their rally.",
    type: 1,
    options: [
      {
        name: "main-rally-leader",
        description: "Select the rally leader everyone should sync to.",
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true,
      },
      {
        name: "hour",
        description: "Hour (UTC)",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 0,
        max_value: 23,
      },
      {
        name: "minute",
        description: "Minute",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 0,
        max_value: 59,
      },
      {
        name: "second",
        description: "Second",
        type: ApplicationCommandOptionType.Integer,
        required: true,
        min_value: 0,
        max_value: 59,
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
    const mainLeaderName = interaction.options.getString(
      "main-rally-leader",
      true,
    );

    const hour = interaction.options.getInteger("hour", true);
    const minute = interaction.options.getInteger("minute", true);
    const second = interaction.options.getInteger("second", true);

    const leaders = await RallyLeaderService.getAll(interaction.guildId);
    const mainLeader = leaders[mainLeaderName];

    if (!mainLeader) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: `❌ Rally leader **${mainLeaderName}** is not registered.`,
      });
    }

    const mainMarchStartTime = dayjs
      .utc()
      .hour(hour)
      .minute(minute)
      .second(second)
      .millisecond(0);

    /**
     * 1. Rally Start
        │
        │ 5 minutes gathering
        ▼
       2. Rally Marches
        │
        │ march time (10s, 20s, 41s...)
        ▼
       3. Castle Arrival
     * 
     */

    // MAIN rally reaches the castle
    const coordinatedArrivalTime = mainMarchStartTime.add(
      mainLeader.marchTime,
      "second",
    );

    const TargetedArrivalTime = coordinatedArrivalTime.add(5, "minute");
    const NAME_WIDTH = 20;

    const rows = Object.values(leaders)
      .sort((a, b) => a.marchTime - b.marchTime)
      .map((leader) => {
        const rallyStartTime = coordinatedArrivalTime.subtract(
          leader.marchTime,
          "second",
        );

        let name = leader.name;
        const star = leader.name === mainLeader.name ? "(C)" : "   ";
        name = `${star}${name}`.padEnd(NAME_WIDTH);

        const time = rallyStartTime.format("HH:mm:ss");
        const march = `[${leader.marchTime.toFixed(0)}s]`;

        return `${name} ${rallyStartTime.format("HH:mm:ss")} [${leader.marchTime.toFixed(0)}s]`;
      });

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: [
        "```",
        "⚔ Rally Sync (UTC)",
        "",
        `🎯 Target Arrival: ${TargetedArrivalTime.format("HH:mm:ss")}`,
        "",
        ...rows,
        "```",
      ].join("\n"),
    });
  },
}).toJSON();
