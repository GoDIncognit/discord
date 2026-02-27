const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ['CHANNEL']
});

const levels = new Map();
const warns = new Map();

client.once('Ready', () => {
  console.log(`🔥 ${client.user.tag} está online`);
});

/* ===============================
   SISTEMA DE NIVELES
================================ */
client.on('messageCreate', message => {
  if (!message.guild || message.author.bot) return;

  const data = levels.get(message.author.id) || { xp: 0, level: 1 };

  data.xp += 10;

  if (data.xp >= data.level * 100) {
    data.level++;
    message.channel.send(`🎉 ${message.author} subió a nivel ${data.level}!`);
  }

  levels.set(message.author.id, data);
});

/* ===============================
   INTERACCIONES (SLASH + BOTONES)
================================ */
client.on('interactionCreate', async interaction => {

  try {

    /* ================= DM PANEL ================= */
    if (!interaction.guild) {

      if (interaction.isChatInputCommand()) {

        if (interaction.commandName === "panel") {

          const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🤖 Panel Privado")
            .setDescription("Selecciona una opción:");

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("ping_dm")
              .setLabel("🏓 Ping")
              .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
              .setCustomId("nivel_dm")
              .setLabel("📊 Mi Nivel")
              .setStyle(ButtonStyle.Success)
          );

          return interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
          });
        }

        return interaction.reply({
          content: "⚠ Usa /panel para abrir el menú.",
          ephemeral: true
        });
      }

      if (interaction.isButton()) {

        if (interaction.customId === "ping_dm") {
          return interaction.reply({
            content: "🏓 Pong desde DM!",
            ephemeral: true
          });
        }

        if (interaction.customId === "nivel_dm") {
          const data = levels.get(interaction.user.id) || { xp: 0, level: 1 };

          return interaction.reply({
            content: `📊 Nivel: ${data.level}\nXP: ${data.xp}`,
            ephemeral: true
          });
        }
      }

      return;
    }

    /* ================= SERVIDOR ================= */

    if (interaction.isChatInputCommand()) {

      if (interaction.commandName === "ping") {
        return interaction.reply("🏓 Pong!");
      }

      if (interaction.commandName === "nivel") {
        const data = levels.get(interaction.user.id) || { xp: 0, level: 1 };

        return interaction.reply(
          `📊 Nivel: ${data.level}\nXP: ${data.xp}`
        );
      }

      if (interaction.commandName === "ban") {

        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.BanMembers)) {
          return interaction.reply({
            content: "❌ No tienes permiso.",
            ephemeral: true
          });
        }

        const user = interaction.options.getUser("usuario");
        const member = interaction.guild.members.cache.get(user.id);

        if (!member)
          return interaction.reply("Usuario no encontrado.");

        await member.ban();

        return interaction.reply(`🔨 ${user.tag} fue baneado.`);
      }

      if (interaction.commandName === "kick") {

        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.KickMembers)) {
          return interaction.reply({
            content: "❌ No tienes permiso.",
            ephemeral: true
          });
        }

        const user = interaction.options.getUser("usuario");
        const member = interaction.guild.members.cache.get(user.id);

        if (!member)
          return interaction.reply("Usuario no encontrado.");

        await member.kick();

        return interaction.reply(`👢 ${user.tag} fue expulsado.`);
      }

      if (interaction.commandName === "warn") {

        const user = interaction.options.getUser("usuario");
        const count = warns.get(user.id) || 0;
        warns.set(user.id, count + 1);

        return interaction.reply(`⚠ ${user.tag} ahora tiene ${count + 1} advertencias.`);
      }

      if (interaction.commandName === "warns") {

        const user = interaction.options.getUser("usuario");
        const count = warns.get(user.id) || 0;

        return interaction.reply(`📋 ${user.tag} tiene ${count} advertencias.`);
      }

      if (interaction.commandName === "clear") {

        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return interaction.reply({
            content: "❌ No tienes permiso.",
            ephemeral: true
          });
        }

        const cantidad = interaction.options.getInteger("cantidad");

        await interaction.deferReply({ ephemeral: true });

        await interaction.channel.bulkDelete(cantidad, true);

        return interaction.editReply(`🧹 ${cantidad} mensajes eliminados.`);
      }

    }

  } catch (error) {
    console.error(error);

    if (interaction.isRepliable() && !interaction.replied) {
      await interaction.reply({
        content: "⚠ Ocurrió un error.",
        ephemeral: true
      });
    }
  }

});

/* ===============================
   LOGS AUTOMÁTICOS
================================ */
client.on("guildMemberRemove", member => {
  const canal = member.guild.channels.cache.find(c => c.name === "logs");
  if (!canal) return;

  canal.send(`📢 ${member.user.tag} salió o fue expulsado.`);
});

client.login(process.env.TOKEN);

