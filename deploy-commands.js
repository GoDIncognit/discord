const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'ping',
    description: 'Responde con Pong!'
  },
  {
    name: 'ban',
    description: 'Banea un usuario',
    options: [
      {
        name: 'usuario',
        type: 6,
        description: 'Usuario a banear',
        required: true
      }
    ]
  },
  {
    name: 'nivel',
    description: 'Mira tu nivel'
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registrando slash commands...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Slash commands listos.');
  } catch (error) {
    console.error(error);
  }
})();
