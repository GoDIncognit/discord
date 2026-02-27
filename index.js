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

/* =========================
   MODERACIÓN
========================= */

// Ban
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith('!ban')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("No tienes permiso para banear.");

    const user = message.mentions.members.first();
    if (!user) return message.reply("Menciona a alguien para banear.");

    await user.ban();
    message.channel.send(`🔨 ${user.user.tag} fue baneado.`);
  }
});

// Kick
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith('!kick')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("No tienes permiso para expulsar.");

    const user = message.mentions.members.first();
    if (!user) return message.reply("Menciona a alguien para expulsar.");

    await user.kick();
    message.channel.send(`👢 ${user.user.tag} fue expulsado.`);
  }
});

// Clear mensajes
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith('!clear')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("No tienes permiso.");

    const cantidad = parseInt(message.content.split(" ")[1]);
    if (!cantidad) return message.reply("Escribe cuántos mensajes borrar.");

    await message.channel.bulkDelete(cantidad, true);
    message.channel.send(`🧹 ${cantidad} mensajes eliminados.`).then(msg => {
      setTimeout(() => msg.delete(), 3000);
    });
  }
});

/* =========================
   IA SIMPLE (modo pro)
========================= */

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith('!ia')) {
    const pregunta = message.content.replace('!ia', '');

    if (!pregunta)
      return message.reply("Escribe algo después de !ia");

    message.reply("🤖 Estoy pensando...");

    // IA simple estilo simulación
    const respuestas = [
      "Interesante pregunta...",
      "Creo que deberías pensarlo mejor 😈",
      "Eso suena peligroso...",
      "Podría funcionar...",
      "No estoy seguro, pero suena bien.",
      "Definitivamente sí.",
      "Definitivamente no.",
    ];

    const respuesta =
      respuestas[Math.floor(Math.random() * respuestas.length)];

    setTimeout(() => {
      message.channel.send(`🤖 IA: ${respuesta}`);
    }, 2000);
  }
});

client.login(process.env.TOKEN);
