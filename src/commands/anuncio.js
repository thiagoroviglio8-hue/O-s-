const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { getGuild } = require("../utils/store");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anuncio")
    .setDescription("Publica un anuncio oficial.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(o => o
      .setName("titulo")
      .setDescription("Título del anuncio")
      .setRequired(true)
      .setMaxLength(256))
    .addStringOption(o => o
      .setName("mensaje")
      .setDescription("Contenido del anuncio")
      .setRequired(true)
      .setMaxLength(3500))
    .addStringOption(o => o
      .setName("mencion")
      .setDescription("A quién mencionar")
      .addChoices(
        { name: "Nadie", value: "none" },
        { name: "@everyone", value: "everyone" },
        { name: "@here", value: "here" }
      )),
  async execute(interaction) {
    const config = getGuild(interaction.guildId);
    const channelId = config.announcementChannel;
    const channel = channelId && interaction.guild.channels.cache.get(channelId);

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: "⚠️ Primero configura el canal con `/configurar anuncios`.",
        ephemeral: true
      });
    }

    const title = interaction.options.getString("titulo");
    const message = interaction.options.getString("mensaje");
    const mention = interaction.options.getString("mencion") || "none";

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(title)
      .setDescription(message)
      .setFooter({ text: `Obsidian Network • ${interaction.guild.name}` })
      .setTimestamp();

    await channel.send({
      content: mention === "everyone" ? "@everyone" : mention === "here" ? "@here" : undefined,
      embeds: [embed],
      allowedMentions: { parse: mention === "none" ? [] : ["everyone"] }
    });

    await interaction.reply({
      content: `✅ Anuncio publicado en ${channel}.`,
      ephemeral: true
    });
  }
};
