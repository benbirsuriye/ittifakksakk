const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('susturma-kaldir')
        .setDescription('Bir kullanıcının susturmasını kaldırır.')
        .addUserOption(option => 
            option.setName('kullanici')
                .setDescription('Susturması kaldırılacak kullanıcı')
                .setRequired(true)),
    async execute(interaction) {
        const requiredRoleId = process.env.REQUIRED_ROLE_ID;

        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }

        const user = interaction.options.getUser('kullanici');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });
        }

        try {
            await member.timeout(null);
            await interaction.reply({ content: `${user.tag} susturması kaldırıldı.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Kullanıcının susturmasını kaldırırken bir hata oluştu.', ephemeral: true });
        }
    }
};
