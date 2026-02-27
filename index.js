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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const warns = new Map();
const spamControl = new Map();

client.once('ready', () => {
  console.log(`🔥 Bot activo como ${client.user.tag}`);
});

/* ===== BIENVENIDA ===== */
client.on('guildMemberAdd', member => {
  const canal = member.guild.systemChannel;
  if (!canal) return;

  const embed = new EmbedBuilder()
    .setColor("Blue")
    .setTitle("🎉 Bienvenido al servidor")
    .setDescription(`Hola ${member}, usa **!help** para ver los comandos.`)
    .setTimestamp();

  canal.send({ embeds: [embed] });
});

client.on('messageCreate', async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  try {

    /* ===== ANTI SPAM ===== */
    const now = Date.now();
    const timestamps = spamControl.get(message.author.id) || [];
    timestamps.push(now);
    spamControl.set(message.author.id, timestamps.filter(t => now - t < 4000));

    if (spamControl.get(message.author.id).length > 5) {
      await message.delete();
      return message.channel.send(`🚫 ${message.author}, no hagas spam.`)
        .then(msg => setTimeout(() => msg.delete(), 3000));
    }

    /* ===== PING ===== */
    if (message.content === '!ping') {
      return message.reply('🏓 Pong!');
    }

    /* ===== HELP ===== */
    if (message.content === '!help') {
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("📖 Comandos disponibles")
        .setDescription(`
🏓 **!ping**
🧹 **!clear número**
🔨 **!ban @usuario**
👢 **!kick @usuario**
⚠️ **!warn @usuario**
📋 **!warns @usuario**
        `)
        .setFooter({ text: "Bot desarrollado por Jeremy Louis" });

      return message.reply({ embeds: [embed] });
    }

    /* ===== CLEAR ===== */
    if (message.content.startsWith('!clear')) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
        return message.reply("❌ No tienes permiso.");

      const cantidad = parseInt(message.content.split(" ")[1]);
      if (!cantidad || cantidad < 1 || cantidad > 100)
        return message.reply("⚠️ Usa un número entre 1 y 100.");

      await message.channel.bulkDelete(cantidad, true);
      return message.channel.send(`🧹 ${cantidad} mensajes eliminados.`);
    }

    /* ===== BAN ===== */
    if (message.content.startsWith('!ban')) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
        return message.reply("❌ No tienes permiso.");

      const user = message.mentions.members.first();
      if (!user) return message.reply("⚠️ Menciona a un usuario.");

      await user.ban();
      return message.channel.send(`🔨 ${user.user.tag} fue baneado.`);
    }

    /* ===== KICK ===== */
    if (message.content.startsWith('!kick')) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
        return message.reply("❌ No tienes permiso.");

      const user = message.mentions.members.first();
      if (!user) return message.reply("⚠️ Menciona a un usuario.");

      await user.kick();
      return message.channel.send(`👢 ${user.user.tag} fue expulsado.`);
    }

    /* ===== WARN ===== */
    if (message.content.startsWith('!warn')) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
        return message.reply("❌ No tienes permiso.");

      const user = message.mentions.members.first();
      if (!user) return message.reply("⚠️ Menciona a un usuario.");

      const userWarns = warns.get(user.id) || 0;
      warns.set(user.id, userWarns + 1);

      return message.channel.send(`⚠️ ${user.user.tag} ahora tiene ${userWarns + 1} advertencias.`);
    }

    /* ===== WARNS ===== */
    if (message.content.startsWith('!warns')) {
      const user = message.mentions.members.first();
      if (!user) return message.reply("⚠️ Menciona a un usuario.");

      const userWarns = warns.get(user.id) || 0;
      return message.channel.send(`📋 ${user.user.tag} tiene ${userWarns} advertencias.`);
    }

  } catch (error) {
    console.error(error);
    message.reply("⚠️ Ocurrió un error.");
  }
});

client.login(process.env.TOKEN);

