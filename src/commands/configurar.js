const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { setGuild } = require("../utils/store");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("configurar")
    .setDescription("Configura los canales y el equipo del bot.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s
      .setName("anuncios")
      .setDescription("Canal para anuncios.")
      .addChannelOption(o => o.setName("canal").setDescription("Canal de anuncios").addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(s => s
      .setName("postulaciones")
      .setDescription("Canal privado para revisar postulaciones.")
      .addChannelOption(o => o.setName("canal").setDescription("Canal privado del equipo").addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(s => s
      .setName("bienvenidas")
      .setDescription("Canal de bienvenida.")
      .addChannelOption(o => o.setName("canal").setDescription("Canal de bienvenida").addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(s => s
      .setName("logs")
      .setDescription("Canal para registros del bot.")
      .addChannelOption(o => o.setName("canal").setDescription("Canal de logs").addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand(s => s
      .setName("staff")
      .setDescription("Rol que tendrá acceso a los tickets.")
      .addRoleOption(o => o.setName("rol").setDescription("Rol del equipo").setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "staff") {
      const role = interaction.options.getRole("rol");
      setGuild(interaction.guildId, { staffRoleId: role.id });
      return interaction.reply({ content: `✅ Rol de staff configurado: ${role}.`, ephemeral: true });
    }

    const channel = interaction.options.getChannel("canal");
    const key = {
      anuncios: "announcementChannel",
      postulaciones: "applicationsChannel",
      bienvenidas: "welcomeChannel",
      logs: "logsChannel"
    }[sub];

    if (!key || !channel?.isTextBased()) {
      return interaction.reply({ content: "⚠️ Selecciona un canal de texto válido.", ephemeral: true });
    }

    setGuild(interaction.guildId, { [key]: channel.id });
    await interaction.reply({ content: `✅ Canal de **${sub}** configurado: ${channel}.`, ephemeral: true });
  }
};
