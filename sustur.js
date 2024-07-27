const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sustur')
        .setDescription('Belirli bir süre için bir kullanıcıyı susturur.')
        .addUserOption(option => 
            option.setName('kullanici')
                .setDescription('Susturulacak kullanıcı')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('sure')
                .setDescription('Susturma süresi (dakika)')
                .setRequired(true)),
    async execute(interaction) {
        const requiredRoleId = process.env.REQUIRED_ROLE_ID;

        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }

        const user = interaction.options.getUser('kullanici');
        const duration = interaction.options.getInteger('sure');

        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });
        }

        try {
            await member.timeout(duration * 60 * 1000);
            await interaction.reply({ content: `${user.tag} ${duration} dakika boyunca susturuldu.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Kullanıcıyı sustururken bir hata oluştu.', ephemeral: true });
        }
    }
};
