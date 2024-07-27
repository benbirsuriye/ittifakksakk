const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oyun-oneri')
        .setDescription('Bir oyun önerisi gönderin.')
        .addStringOption(option => 
            option.setName('oneri')
                .setDescription('Oyun önerinizi yazın')
                .setRequired(true)),
    async execute(interaction) {
        const oneri = interaction.options.getString('oneri');
        const channelId = process.env.channel_id;

        try {
            const channel = await interaction.client.channels.fetch(channelId);
            console.log(`Fetched channel: ${channel}`);

            if (!channel) {
                return interaction.reply({ content: 'Öneri kanalı bulunamadı.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Yeni Oyun Önerisi')
                .setDescription(oneri)
                .setTimestamp()
                .setFooter({ text: `Öneren: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            await channel.send({ embeds: [embed] });
            await interaction.reply({ content: 'Oyun öneriniz gönderildi!', ephemeral: true });
        } catch (error) {
            console.error('Error fetching the channel or sending the message:', error);
            await interaction.reply({ content: 'Öneri kanalı bulunamadı veya mesaj gönderilemedi.', ephemeral: true });
        }
    },
};
