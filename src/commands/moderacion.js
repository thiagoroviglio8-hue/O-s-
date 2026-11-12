const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: [
    new SlashCommandBuilder().setName("limpiar").setDescription("Elimina mensajes recientes.")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .addIntegerOption(o => o.setName("cantidad").setDescription("Entre 1 y 100").setRequired(true).setMinValue(1).setMaxValue(100)),
    new SlashCommandBuilder().setName("timeout").setDescription("Pone a un miembro en tiempo de espera.")
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption(o => o.setName("usuario").setDescription("Miembro").setRequired(true))
      .addIntegerOption(o => o.setName("minutos").setDescription("Duración, máximo 40320").setRequired(true).setMinValue(1).setMaxValue(40320))
      .addStringOption(o => o.setName("razon").setDescription("Motivo").setRequired(false).setMaxLength(500))
  ],
  async execute(interaction) {
    if (interaction.commandName === "limpiar") {
      const amount = interaction.options.getInteger("cantidad");
      const deleted = await interaction.channel.bulkDelete(amount, true);
      return interaction.reply({ content: `🧹 Se eliminaron ${deleted.size} mensajes.`, ephemeral: true });
    }
    const user = interaction.options.getUser("usuario");
    const minutes = interaction.options.getInteger("minutos");
    const reason = interaction.options.getString("razon") || "Sin motivo especificado";
    const member = await interaction.guild.members.fetch(user.id);
    await member.timeout(minutes * 60 * 1000, reason);
    await interaction.reply({ content: `✅ ${user.tag} recibió timeout durante ${minutes} minuto(s). Motivo: ${reason}`, ephemeral: true });
  }
};