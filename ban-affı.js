const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban-affı')
        .setDescription('Yasaklı olan ve harici olmayan herkesin banını açar.')
        .addStringOption(option => option.setName('harici1').setDescription('Harici kullanıcı ID 1'))
        .addStringOption(option => option.setName('harici2').setDescription('Harici kullanıcı ID 2'))
        .addStringOption(option => option.setName('harici3').setDescription('Harici kullanıcı ID 3'))
        .addStringOption(option => option.setName('harici4').setDescription('Harici kullanıcı ID 4'))
        .addStringOption(option => option.setName('harici5').setDescription('Harici kullanıcı ID 5'))
        .addStringOption(option => option.setName('harici6').setDescription('Harici kullanıcı ID 6')),
    async execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için ban üyelerini yönetme yetkisine sahip olmalısınız.', ephemeral: true });
        }

        const hariciler = [
            interaction.options.getString('harici1'),
            interaction.options.getString('harici2'),
            interaction.options.getString('harici3'),
            interaction.options.getString('harici4'),
            interaction.options.getString('harici5'),
            interaction.options.getString('harici6')
        ].filter(Boolean);

        try {
            const requiredRoleId = process.env.REQUIRED_ROLE_ID;

            if (!interaction.member.roles.cache.has(requiredRoleId)) {
                return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
            }
            await interaction.deferReply();

            const bannedUsers = await interaction.guild.bans.fetch();
            const unbannedUsers = [];

            for (const [userId, banInfo] of bannedUsers) {
                if (!hariciler.includes(userId)) {
                    await interaction.guild.bans.remove(userId);
                    unbannedUsers.push(banInfo.user.tag);
                }
            }

            if (unbannedUsers.length === 0) {
                await interaction.editReply('Yasaklı kullanıcı bulunamadı veya tüm yasaklı kullanıcılar harici olarak belirtilmiş.');
            } else {
                await interaction.editReply(`Ban affı işlemi tamamlandı. ${unbannedUsers.length} kullanıcının banı açıldı:\n${unbannedUsers.join('\n')}`);
            }
        } catch (error) {
            console.error('Ban affı işlemi sırasında bir hata oluştu:', error);
            await interaction.editReply({ content: 'Ban affı işlemi sırasında bir hata oluştu.', ephemeral: true });
        }
    },
};
