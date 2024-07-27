const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tam-yasakla-kaldir')
        .setDescription('Kullanıcının tüm sunuculardan yasağını kaldır.')
        .addUserOption(option => 
            option.setName('kullanici')
                .setDescription('Yasağı kaldırılacak kullanıcı')
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
            const unbannedGuilds = [];
            interaction.client.guilds.cache.forEach(async (guild) => {
                try {
                    await guild.members.unban(user.id);
                    unbannedGuilds.push(guild.name);
                } catch (error) {
                    console.error(`Kullanıcı ${user.id} sunucudan yasağı kaldırılamadı: ${guild.name}`, error);
                }
            });

            const embed = new EmbedBuilder()
                .setTitle('Kullanıcı Yasağı Kaldırıldı')
                .addField('Kullanıcı', user.tag, true)
                .addField('Yasağı Kaldırıldığı Sunucular', unbannedGuilds.join('\n'), true);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Kullanıcının yasağı kaldırılırken bir hata oluştu.', ephemeral: true });
        }
    }
};
