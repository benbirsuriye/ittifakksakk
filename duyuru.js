const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duyuru')
        .setDescription('Bir duyuru gönderin.')
        .addStringOption(option => 
            option.setName('mesaj')
                .setDescription('Duyuru mesajınızı yazın (satır atlamak için shift+enter)')
                .setRequired(true))
        .addBooleanOption(option => 
            option.setName('ittifak_duyurusu')
                .setDescription('Bu duyuru ittifak duyurusu mu?')
                .setRequired(true))
        .addChannelOption(option => 
            option.setName('kanal')
                .setDescription('Duyurunun gönderileceği kanal')
                .setRequired(true)
                .addChannelTypes([0])),
    async execute(interaction) {
        const allowedUserIds = process.env.ALLOWED_USER_IDS.split(',');

        if (!allowedUserIds.includes(interaction.user.id)) {
            return interaction.reply({ content: 'Bu komutu kullanma izniniz yok.', ephemeral: true });
        }

        const mesaj = interaction.options.getString('mesaj');
        const ittifakDuyurusu = interaction.options.getBoolean('ittifak_duyurusu');
        const kanal = interaction.options.getChannel('kanal');

        try {
            let duyuruMesaji = mesaj;
            if (ittifakDuyurusu) {
                duyuruMesaji += `\n\nKanal ID: ${kanal.id}`;
            }

            await kanal.send(duyuruMesaji);
            await interaction.reply({ content: 'Duyuru başarıyla gönderildi!', ephemeral: true });
        } catch (error) {
            console.error('Error sending announcement:', error);
            await interaction.reply({ content: 'Duyuru gönderilirken bir hata oluştu.', ephemeral: true });
        }
    },
};
