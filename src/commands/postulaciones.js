const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { getGuild } = require("../utils/store");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("postulaciones").setDescription("Publica el panel de postulaciones.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("publicar").setDescription("Publica el botón para postularse.")),
  async execute(interaction) {
    const config = getGuild(interaction.guildId);
    if (!config.applicationsChannel) {
      return interaction.reply({ content: "⚠️ Configura primero el canal de revisión con `/configurar postulaciones`.", ephemeral: true });
    }
    const embed = new EmbedBuilder().setColor(0x5865F2).setTitle("📋 Postulaciones | Obsidian Network")
      .setDescription("¿Quieres formar parte de nuestro equipo? Pulsa el botón y completa el formulario.\n\n**Importante:** responde con sinceridad. El equipo revisará tu solicitud y te comunicará la decisión por mensaje privado.")
      .setFooter({ text: "Obsidian Network • Equipo administrativo" });
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("application:open").setLabel("Postularme").setStyle(ButtonStyle.Primary).setEmoji("📝")
    );
    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: "✅ Panel de postulaciones publicado.", ephemeral: true });
  }
};