// index.js
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const fs = require('fs');

// ---------------------------
// Cliente
// ---------------------------
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

// ---------------------------
// Mapas y persistencia
// ---------------------------
const levels = new Map();
let warns = {};

// Cargar advertencias desde JSON
if (fs.existsSync('./warns.json')) {
  warns = JSON.parse(fs.readFileSync('./warns.json', 'utf8'));
}

// Guardar advertencias en JSON
function saveWarns() {
  fs.writeFileSync('./warns.json', JSON.stringify(warns, null, 2));
}

// ---------------------------
// Palabras prohibidas
// ---------------------------
const blacklist = ['insulto1', 'insulto2', 'maldicion', 'tonto', 'idiota']; 
const warnedTemp = new Map(); // para avisos antes de la advertencia

// ---------------------------
// Evento ready
// ---------------------------
client.once('ready', () => {
  console.log(`🔥 ${client.user.tag} está online`);
});

// ---------------------------
// Sistema de niveles
// ---------------------------
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

// ---------------------------
// Moderación automática
// ---------------------------
client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;

  const lowerMsg = message.content.toLowerCase();
  const containsBadWord = blacklist.some(word => lowerMsg.includes(word));

  if (containsBadWord) {

    // Primer aviso si no lo tenía
    if (!warnedTemp.has(message.author.id)) {
      const dm = await message.author.createDM();
      await dm.send(`⚠ Hola ${message.author.username}, tu mensaje contiene palabras ofensivas. Si vuelves a hacerlo, recibirás una advertencia.`);
      warnedTemp.set(message.author.id, true);
      return;
    }

    // Segunda infracción: sumar advertencia
    if (!warns[message.author.id]) warns[message.author.id] = 0;
    warns[message.author.id] += 1;
    saveWarns();

    let replyMsg = `⚠ ${message.author.tag} ahora tiene ${warns[message.author.id]} advertencias por maltrato/insultos.`;

    // Banear si alcanza 3 advertencias
    if (warns[message.author.id] >= 3) {
      const member = message.guild.members.cache.get(message.author.id);
      if (member) {
        await member.ban({ reason: 'Alcanzó 3 advertencias (maltrato/insultos)' });
        replyMsg += `\n🔨 ${message.author.tag} ha sido baneado por 3 advertencias.`;
      }
    }

    await message.reply(replyMsg);
    warnedTemp.delete(message.author.id);
  }
});

// ---------------------------
// Interacciones (slash + botones)
// ---------------------------
client.on('interactionCreate', async interaction => {
  try {
    if (!interaction.guild) {
      // Panel DM
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

          return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }

        if (interaction.commandName === "invite") {
          return interaction.reply({
            content: "🔗 Invita al bot usando este link: https://discord.com/oauth2/authorize?client_id=1476975549376237639&permissions=8&integration_type=0&scope=bot",
            ephemeral: true
          });
        }

        if (interaction.commandName === "help") {
          return interaction.reply({
            content: "📌 Comandos disponibles:\n/ping\n/nivel\n/ban\n/kick\n/warn\n/warns\n/clear\n/panel\n/help\n/invite",
            ephemeral: true
          });
        }

        return interaction.reply({ content: "⚠ Usa /panel para abrir el menú.", ephemeral: true });
      }

      if (interaction.isButton()) {
        if (interaction.customId === "ping_dm") return interaction.reply({ content: "🏓 Pong desde DM!", ephemeral: true });
        if (interaction.customId === "nivel_dm") {
          const data = levels.get(interaction.user.id) || { xp: 0, level: 1 };
          return interaction.reply({ content: `📊 Nivel: ${data.level}\nXP: ${data.xp}`, ephemeral: true });
        }
      }

      return;
    }

    // ================= Servidor =================
    if (interaction.isChatInputCommand()) {
      const user = interaction.options.getUser ? interaction.options.getUser("usuario") : null;

      switch (interaction.commandName) {
        case "ping":
          return interaction.reply("🏓 Pong!");
        case "nivel": {
          const data = levels.get(interaction.user.id) || { xp: 0, level: 1 };
          return interaction.reply(`📊 Nivel: ${data.level}\nXP: ${data.xp}`);
        }
        case "ban":
          if (!interaction.memberPermissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });
          if (!user) return interaction.reply("Usuario no encontrado.");
          const memberBan = interaction.guild.members.cache.get(user.id);
          if (!memberBan) return interaction.reply("Usuario no encontrado.");
          await memberBan.ban();
          return interaction.reply(`🔨 ${user.tag} fue baneado.`);
        case "kick":
          if (!interaction.memberPermissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });
          if (!user) return interaction.reply("Usuario no encontrado.");
          const memberKick = interaction.guild.members.cache.get(user.id);
          if (!memberKick) return interaction.reply("Usuario no encontrado.");
          await memberKick.kick();
          return interaction.reply(`👢 ${user.tag} fue expulsado.`);
        case "warn":
          if (!user) return interaction.reply("Usuario no encontrado.");
          if (!warns[user.id]) warns[user.id] = 0;
          warns[user.id] += 1;
          saveWarns();
          return interaction.reply(`⚠ ${user.tag} ahora tiene ${warns[user.id]} advertencias.`);
        case "warns":
          if (!user) return interaction.reply("Usuario no encontrado.");
          return interaction.reply(`📋 ${user.tag} tiene ${warns[user.id] || 0} advertencias.`);
        case "clear":
          if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: "❌ No tienes permiso.", ephemeral: true });
          const cantidad = interaction.options.getInteger("cantidad");
          await interaction.deferReply({ ephemeral: true });
          await interaction.channel.bulkDelete(cantidad, true);
          return interaction.editReply(`🧹 ${cantidad} mensajes eliminados.`);
        case "invite":
          return interaction.reply({
            content: "🔗 Invita al bot usando este link: https://discord.com/oauth2/authorize?client_id=1476975549376237639&permissions=8&integration_type=0&scope=bot",
            ephemeral: true
          });
        case "help":
          return interaction.reply({
            content: "📌 Comandos disponibles:\n/ping\n/nivel\n/ban\n/kick\n/warn\n/warns\n/clear\n/panel\n/help\n/invite",
            ephemeral: true
          });
      }
    }

  } catch (error) {
    console.error(error);
    if (interaction.isRepliable() && !interaction.replied) await interaction.reply({ content: "⚠ Ocurrió un error.", ephemeral: true });
  }
});

// ---------------------------
// Logs automáticos
// ---------------------------
client.on("guildMemberRemove", member => {
  const canal = member.guild.channels.cache.find(c => c.name === "logs");
  if (!canal) return;
  canal.send(`📢 ${member.user.tag} salió o fue expulsado.`);
});

// ---------------------------
// Login
// ---------------------------
client.login(process.env.TOKEN);
