const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aktiflik-sayaç')
        .setDescription('Belirli bir Roblox oyunundaki aktif oyuncu sayısını gösterir.'),
    async execute(interaction) {
        const oyunId = '17625538139'; // Sabit oyun ID'si

        await interaction.deferReply();

        try {
            const universeResponse = await axios.get(`https://apis.roblox.com/universes/v1/places/${oyunId}/universe`);
            const universeId = universeResponse.data.universeId;

            const gameResponse = await axios.get(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
            const gameData = gameResponse.data.data[0];
            const playerCount = gameData.playing;

            const embed = new EmbedBuilder()
                .setTitle('Oyunun Aktifliği')
                .addFields(
                    { name: 'Aktif Oyuncu Sayısı', value: `${playerCount}` }
                )
                .setColor('#00FF00')
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Oyun bilgisi sorgulanırken bir hata oluştu.' });
        }
    },
};
