const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tam-yasakla')
        .setDescription('Kullanıcıyı tüm sunuculardan yasakla.')
        .addUserOption(option => 
            option.setName('kullanici')
                .setDescription('Yasaklanacak kullanıcı')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('sebep')
                .setDescription('Yasaklama sebebi')
                .setRequired(true)),
    async execute(interaction) {
        const requiredRoleId = process.env.REQUIRED_ROLE_ID;

        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }

        const user = interaction.options.getUser('kullanici');
        const reason = interaction.options.getString('sebep');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });
        }

        try {
            await user.send(`Sebebiyle yasaklandın: ${reason}`);

            const bannedGuilds = [];
            interaction.client.guilds.cache.forEach(async (guild) => {
                try {
                    await guild.members.ban(user.id, { reason });
                    bannedGuilds.push(guild.name);
                } catch (error) {
                    console.error(`Kullanıcı ${user.id} sunucudan yasaklanamadı: ${guild.name}`, error);
                }
            });

            const embed = new EmbedBuilder()
                .setTitle('Kullanıcı Yasaklandı')
                .addField('Kullanıcı', user.tag, true)
                .addField('Sebep', reason, true)
                .addField('Yasaklandığı Sunucular', bannedGuilds.join('\n'), true);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Kullanıcı yasaklanırken bir hata oluştu.', ephemeral: true });
        }
    }
};
