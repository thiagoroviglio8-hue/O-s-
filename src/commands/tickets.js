const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("tickets").setDescription("Publica el panel de soporte.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s => s.setName("publicar").setDescription("Publica el panel de tickets.")),
  async execute(interaction) {
    const embed = new EmbedBuilder().setColor(0x5865F2).setTitle("🎫 Soporte | Obsidian Network")
      .setDescription("¿Necesitas ayuda? Pulsa **Abrir ticket** para crear un canal privado con el equipo.");
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("ticket:open").setLabel("Abrir ticket").setStyle(ButtonStyle.Success).setEmoji("🎫")
    );
    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: "✅ Panel de tickets publicado.", ephemeral: true });
  }
};