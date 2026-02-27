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

client.once('ready', () => {
  console.log(`Bot encendido como ${client.user.tag}`);
});

/* 📢 MENSAJE DE BIENVENIDA */
client.on('guildMemberAdd', member => {
  const canal = member.guild.systemChannel;
  if (!canal) return;

  const embed = new EmbedBuilder()
    .setColor("Blue")
    .setTitle("🎉 Nuevo miembro")
    .setDescription(`Bienvenido ${member} al servidor!\n\nEscribe **!help** para ver mis comandos.`)
    .setTimestamp();

  canal.send({ embeds: [embed] });
});

client.on('messageCreate', async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  try {

    /* 🏓 PING */
    if (message.content === '!ping') {
      return message.reply('Pong 🏓');
    }

    /* 📜 HELP */
    if (message.content === '!help') {
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("📖 Comandos disponibles")
        .setDescription(`
        🏓 **!ping** → Verifica si estoy activo  
        🤖 **!ia (mensaje)** → Respuesta IA simple  
        🔨 **!ban @user** → Banear usuario  
        👢 **!kick @user** → Expulsar usuario  
        🧹 **!clear número** → Borrar mensajes  
        `)
        .setFooter({ text: "Bot desarrollado por GoDIncognit" });

      return message.reply({ embeds: [embed] });
    }

    /* 🤖 IA SIMPLE */
    if (message.content.startsWith('!ia')) {
      const texto = message.content.slice(3).trim();
      if (!texto) return message.reply("Escribe algo después de !ia");

      return message.reply(`🤖 Respuesta automática a: "${texto}"`);
    }

    /* 💬 RESPUESTA AUTOMÁTICA */
    if (message.content.toLowerCase() === 'hola') {
      return message.reply("👋 Hola! Escribe !help para ver lo que puedo hacer.");
    }

  } catch (error) {
    console.error(error);
    message.reply("⚠️ Ocurrió un error.");
  }
});

client.login(process.env.TOKEN);
