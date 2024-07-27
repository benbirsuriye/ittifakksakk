require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const { REST, Routes } = require('@discordjs/rest');
const fs = require('fs');
const path = require('path');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildBans,
    ],
    partials: [Partials.Channel]
});

// Komut dosyalarını yükleme
client.commands = new Map();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// Komutları kaydetme
client.on('ready', async () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
    client.user.setActivity('TAVSO made by tubers', { type: ActivityType.Playing });

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    const commands = Array.from(client.commands.values()).map(cmd => cmd.data.toJSON());

    try {
        if (client.application?.commands) {
            await client.application.commands.set(commands);
        } else {
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
        }
        console.log('Tüm komutlar başarıyla yüklendi!');
    } catch (error) {
        console.error(error);
    }

    // Botu ses kanalına katma
    const channel = client.channels.cache.get(process.env.VOICE_CHANNEL_ID);
    if (channel && channel.isVoiceBased()) {
        try {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            console.log('Bot ses kanalına katıldı!');
        } catch (error) {
            console.error('Bot ses kanalına katılamadı:', error);
        }
    }
});

// Yeni üye katıldığında hoş geldin mesajı gönderme
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
    if (channel) {
        channel.send(`Hoş geldin ${member}!`);
    }
});

// Slash komutlarını dinleme
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.followUp({ content: 'Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
