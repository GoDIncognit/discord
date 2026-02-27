const { 
  Client, 
  GatewayIntentBits, 
  PermissionsBitField 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`Bot encendido como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  try {

    // Ping
    if (message.content === '!ping') {
      return message.reply('Pong 🏓');
    }

    // IA
    if (message.content.startsWith('!ia')) {
      const pregunta = message.content.slice(3).trim();
      if (!pregunta) return message.reply("Escribe algo después de !ia");

      return message.reply("🤖 Estoy pensando...");
    }

    // Ban
    if (message.content.startsWith('!ban')) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
        return message.reply("No tienes permiso.");

      const user = message.mentions.members.first();
      if (!user) return message.reply("Menciona a alguien.");

      await user.ban();
      return message.channel.send(`🔨 ${user.user.tag} fue baneado.`);
    }

    // Kick
    if (message.content.startsWith('!kick')) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
        return message.reply("No tienes permiso.");

      const user = message.mentions.members.first();
      if (!user) return message.reply("Menciona a alguien.");

      await user.kick();
      return message.channel.send(`👢 ${user.user.tag} fue expulsado.`);
    }

    // Clear
    if (message.content.startsWith('!clear')) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
        return message.reply("No tienes permiso.");

      const cantidad = parseInt(message.content.split(" ")[1]);
      if (!cantidad || cantidad < 1 || cantidad > 100)
        return message.reply("Pon un número entre 1 y 100.");

      await message.channel.bulkDelete(cantidad, true);
      const msg = await message.channel.send(`🧹 ${cantidad} mensajes eliminados.`);
      setTimeout(() => msg.delete(), 3000);
    }

  } catch (error) {
    console.error(error);
    message.reply("⚠️ Ocurrió un error.");
  }
});

client.login(process.env.TOKEN);
