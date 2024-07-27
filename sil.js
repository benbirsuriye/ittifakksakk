const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sil')
        .setDescription('Belirtilen sayıda mesajı siler.')
        .addIntegerOption(option => option.setName('miktar').setDescription('Silinecek mesaj sayısı').setRequired(true)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('miktar');
        const member = interaction.guild.members.cache.get(interaction.user.id);

        // İzin kontrolü
        if (!member.roles.cache.has('1213812765714812968')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için gerekli role sahip değilsiniz.', ephemeral: true });
        }

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'Lütfen 1 ile 100 arasında bir sayı girin.', ephemeral: true });
        }

        try {
            const messages = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `${messages.size} mesaj başarıyla silindi.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Mesajlar silinirken bir hata oluştu.', ephemeral: true });
        }
    },
};
