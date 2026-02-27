const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

const levels = new Map();

client.once('ready', () => {
  console.log(`🔥 ${client.user.tag} está online`);
});

/* =======================
   SISTEMA DE NIVELES
======================= */

client.on('messageCreate', message => {
  if (!message.guild || message.author.bot) return;

  const userData = levels.get(message.author.id) || { xp: 0, level: 1 };

  userData.xp += 10;

  if (userData.xp >= userData.level * 100) {
    userData.level++;
    message.channel.send(`🎉 ${message.author} subió a nivel ${userData.level}!`);
  }

  levels.set(message.author.id, userData);
});

/* =======================
   SLASH COMMANDS
======================= */

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('🏓 Pong!');
  }

  if (interaction.commandName === 'nivel') {
    const userData = levels.get(interaction.user.id) || { xp: 0, level: 1 };

    await interaction.reply(
      `📊 Nivel: ${userData.level}\nXP: ${userData.xp}`
    );
  }

  if (interaction.commandName === 'ban') {
    if (!interaction.memberPermissions.has(PermissionsBitField.Flags.BanMembers))
      return interaction.reply({ content: '❌ No tienes permiso.', ephemeral: true });

    const user = interaction.options.getUser('usuario');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) return interaction.reply('Usuario no encontrado.');

    await member.ban();

    await interaction.reply(`🔨 ${user.tag} fue baneado.`);
  }
});

/* =======================
   LOGS AUTOMÁTICOS
======================= */

client.on('guildMemberRemove', member => {
  const canal = member.guild.channels.cache.find(c => c.name === "logs");
  if (!canal) return;

  canal.send(`📢 ${member.user.tag} salió o fue expulsado.`);
});

client.login(process.env.TOKEN);
