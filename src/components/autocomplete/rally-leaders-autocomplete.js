const AutocompleteComponent = require("../../structure/AutocompleteComponent");
const RallyLeaderService = require("../../service/kvk-rallies");

module.exports = new AutocompleteComponent({
  commandName: ["remove-or-reset-all-rally", "get-sync-time"],

  run: async (client, interaction) => {
    const leaders = await RallyLeaderService.getAll(interaction.guildId);

    const currentInput = interaction.options.getFocused().toLowerCase();

    const options = Object.values(leaders)
      .filter((leader) => leader.name.toLowerCase().includes(currentInput))
      .slice(0, 25)
      .map((leader) => ({
        name: leader.name,
        value: leader.name,
      }));

    await interaction.respond(options);
  },
}).toJSON();
