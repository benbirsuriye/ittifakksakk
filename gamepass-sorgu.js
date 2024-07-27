const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); 

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, retries = 3, backoff = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios(url, options);
            return response;
        } catch (error) {
            if (error.response && error.response.status === 429) {
                if (i < retries - 1) {
                    console.log(`429 Too Many Requests, retrying in ${backoff}ms...`);
                    await wait(backoff);
                    backoff *= 2; // exponential backoff
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamepass-sorgu')
        .setDescription('Belirtilen bir Roblox kullanıcısının belirli bir gamepass\'e sahip olup olmadığını kontrol eder.')
        .addStringOption(option => option.setName('kullanıcı').setDescription('Roblox kullanıcı adı').setRequired(true))
        .addStringOption(option => option.setName('gamepass').setDescription('Gamepass ID').setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('kullanıcı');
        const gamepassId = interaction.options.getString('gamepass');
        const requiredRoleId = process.env.REQUIRED_ROLE_ID;

        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }
        await interaction.deferReply();

        try {
            // Kullanıcı adını kullanıcı kimliğine dönüştürme
            const userResponse = await fetchWithRetry(`https://users.roblox.com/v1/users/search?keyword=${username}`);
            if (userResponse.data.data.length === 0) {
                return interaction.editReply({ content: `Kullanıcı bulunamadı: ${username}` });
            }

            const userId = userResponse.data.data[0].id;

            // Gamepass sorgusu
            const gamepassResponse = await fetchWithRetry(`https://inventory.roblox.com/v1/users/${userId}/items/1/${gamepassId}/is-owned`);
            const hasGamepass = gamepassResponse.data;

            const embed = new EmbedBuilder()
                .setTitle('Gamepass Sorgu Sonucu')
                .setDescription(`${username} adlı kullanıcı ${gamepassId} ID'li gamepass'e ${hasGamepass ? 'sahip' : 'sahip değil'}.`)
                .setColor(hasGamepass ? '#00FF00' : '#FF0000');

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Gamepass sorgusu yapılırken bir hata oluştu.' });
        }
    },
};
