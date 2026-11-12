require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const {
  Client, GatewayIntentBits, Partials, Collection, Events, EmbedBuilder,
  ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField
} = require("discord.js");
const { getGuild } = require("./utils/store");

if (!process.env.DISCORD_TOKEN) throw new Error("Falta DISCORD_TOKEN en .env");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel]
});
const commands = new Collection();
const commandDir = path.join(__dirname, "commands");
for (const file of fs.readdirSync(commandDir).filter(f => f.endsWith(".js"))) {
  const cmd = require(path.join(commandDir, file));
  for (const data of (Array.isArray(cmd.data) ? cmd.data : [cmd.data])) {
    commands.set(data.name, { ...cmd, data });
  }
}

client.once(Events.ClientReady, c => console.log(`Conectado como ${c.user.tag}`));

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === "application:open") {
        const modal = new ModalBuilder().setCustomId("application:submit").setTitle("Postulación • Obsidian Network");
        const fields = [
          ["age", "¿Qué edad tienes?", "Ejemplo: 16", TextInputStyle.Short],
          ["role", "¿A qué rango quieres postularte?", "Helper, Moderador, Builder...", TextInputStyle.Short],
          ["experience", "¿Qué experiencia tienes?", "Cuéntanos sobre tu experiencia", TextInputStyle.Paragraph],
          ["why", "¿Por qué quieres entrar al equipo?", "Explica tus motivos", TextInputStyle.Paragraph],
          ["availability", "¿Qué disponibilidad tienes?", "Días y horarios aproximados", TextInputStyle.Short]
        ];
        modal.addComponents(...fields.map(([id, label, placeholder, style]) =>
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(id).setLabel(label)
            .setPlaceholder(placeholder).setStyle(style).setRequired(true).setMaxLength(style === TextInputStyle.Paragraph ? 900 : 100))
        ));
        await interaction.showModal(modal);
        return;
      }

      if (interaction.customId === "ticket:open") {
        const existing = interaction.guild.channels.cache.find(ch =>
          ch.type === ChannelType.GuildText && ch.topic === `ticket-owner:${interaction.user.id}`);
        if (existing) return interaction.reply({ content: `Ya tienes un ticket abierto: ${existing}`, ephemeral: true });
        const guildConfig = getGuild(interaction.guildId);
        const overwrites = [
          { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
          { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
        ];
        if (guildConfig.staffRoleId) overwrites.push({
          id: guildConfig.staffRoleId,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
        });
        const channel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 90),
          type: ChannelType.GuildText,
          topic: `ticket-owner:${interaction.user.id}`,
          permissionOverwrites: overwrites
        });
        const close = new ActionRowBuilder().addComponents(new ButtonBuilder()
          .setCustomId("ticket:close").setLabel("Cerrar ticket").setStyle(ButtonStyle.Danger));
        await channel.send({ content: `${interaction.user} Bienvenido/a. Describe tu consulta y el equipo te ayudará.`, components: [close] });
        await interaction.reply({ content: `✅ Ticket creado: ${channel}`, ephemeral: true });
        return;
      }

      if (interaction.customId === "ticket:close") {
        const ownerId = interaction.channel.topic?.replace("ticket-owner:", "");
        const canClose = interaction.user.id === ownerId || interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageChannels);
        if (!canClose) return interaction.reply({ content: "No tienes permiso para cerrar este ticket.", ephemeral: true });
        await interaction.reply("🔒 Este ticket se cerrará en 5 segundos.");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        return;
      }

      if (interaction.customId.startsWith("application:decision:")) {
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild)) {
          return interaction.reply({ content: "No tienes permiso para revisar postulaciones.", ephemeral: true });
        }
        const [, , decision, applicantId] = interaction.customId.split(":");
        const approved = decision === "accept";
        const original = interaction.message.embeds[0];
        const updated = EmbedBuilder.from(original).setColor(approved ? 0x2ECC71 : 0xE74C3C)
          .addFields({ name: "Decisión", value: `${approved ? "Aceptada" : "Rechazada"} por ${interaction.user}` });
        await interaction.update({ embeds: [updated], components: [] });
        try {
          const applicant = await client.users.fetch(applicantId);
          await applicant.send(approved
            ? "🎉 ¡Tu postulación para Obsidian Network fue aceptada! El equipo se pondrá en contacto contigo."
            : "Gracias por postularte a Obsidian Network. En esta ocasión tu solicitud no fue aceptada.");
        } catch {}
        return;
      }
    }

    if (interaction.isModalSubmit() && interaction.customId === "application:submit") {
      await interaction.deferReply({ ephemeral: true });
      const config = getGuild(interaction.guildId);
      const reviewChannel = config.applicationsChannel && interaction.guild.channels.cache.get(config.applicationsChannel);
      if (!reviewChannel || !reviewChannel.isTextBased()) {
        return interaction.editReply("El canal de revisión no está configurado. Contacta con un administrador.");
      }
      const embed = new EmbedBuilder().setColor(0x5865F2).setTitle("📨 Nueva postulación")
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: "Usuario", value: `${interaction.user} (${interaction.user.tag})` },
          { name: "Edad", value: interaction.fields.getTextInputValue("age") },
          { name: "Rango solicitado", value: interaction.fields.getTextInputValue("role") },
          { name: "Experiencia", value: interaction.fields.getTextInputValue("experience") },
          { name: "Motivación", value: interaction.fields.getTextInputValue("why") },
          { name: "Disponibilidad", value: interaction.fields.getTextInputValue("availability") }
        ).setTimestamp();
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`application:decision:accept:${interaction.user.id}`).setLabel("Aceptar").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`application:decision:reject:${interaction.user.id}`).setLabel("Rechazar").setStyle(ButtonStyle.Danger)
      );
      await reviewChannel.send({ embeds: [embed], components: [row] });
      await interaction.editReply("✅ Tu postulación fue enviada correctamente. ¡Gracias por tu interés!");
    }
  } catch (error) {
    console.error(error);
    const message = "Ocurrió un error al ejecutar esta acción. Revisa los permisos y la consola del bot.";
    if (interaction.deferred || interaction.replied) await interaction.followUp({ content: message, ephemeral: true }).catch(() => {});
    else await interaction.reply({ content: message, ephemeral: true }).catch(() => {});
  }
});

client.on(Events.GuildMemberAdd, async member => {
  const config = getGuild(member.guild.id);
  const channel = config.welcomeChannel && member.guild.channels.cache.get(config.welcomeChannel);
  if (channel?.isTextBased()) {
    const embed = new EmbedBuilder().setColor(0x5865F2).setTitle("👋 ¡Bienvenido/a a Obsidian Network!")
      .setDescription(`¡Hola ${member}! Gracias por unirte a **${member.guild.name}**.\nAhora somos **${member.guild.memberCount}** miembros.`)
      .setThumbnail(member.user.displayAvatarURL()).setTimestamp();
    channel.send({ embeds: [embed] }).catch(console.error);
  }
});

client.login(process.env.DISCORD_TOKEN);