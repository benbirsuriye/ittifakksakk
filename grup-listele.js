const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const waittime = 10000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('grup-listele')
        .setDescription('Belirtilen bir Roblox kullanıcısının bulunduğu grupları listeler.')
        .addStringOption(option => option.setName('kullanıcı').setDescription('Roblox kullanıcı adı').setRequired(true)),
    async execute(interaction) {
        const username = interaction.options.getString('kullanıcı');
        const requiredRoleId = process.env.REQUIRED_ROLE_ID;

        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
        }
        await interaction.deferReply();

        try {
            // Kullanıcı adını kullanıcı kimliğine dönüştürme
            let userResponse;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    userResponse = await axios.get(`https://users.roblox.com/v1/users/search?keyword=${username}`);
                    if (userResponse.data.data.length === 0) {
                        return interaction.editReply({ content: `Kullanıcı bulunamadı: ${username}` });
                    }
                    break;
                } catch (error) {
                    if (error.response && error.response.status === 429) {
                        attempts++;
                        await wait(2000 * attempts); // Deneme aralığını artır
                    } else {
                        throw error;
                    }
                }
            }

            if (!userResponse || !userResponse.data || !userResponse.data.data.length) {
                return interaction.editReply({ content: `Kullanıcı bulunamadı: ${username}` });
            }

            const userId = userResponse.data.data[0].id;

            // Grup listesi sorgusu
            let groupResponse;
            attempts = 0;

            while (attempts < maxAttempts) {
                try {
                    groupResponse = await axios.get(`https://groups.roblox.com/v1/users/${userId}/groups/roles`);
                    break;
                } catch (error) {
                    if (error.response && error.response.status === 429) {
                        attempts++;
                        await wait(2000 * attempts);
                    } else {
                        throw error;
                    }
                }
            }

            if (!groupResponse || !groupResponse.data || !groupResponse.data.data) {
                return interaction.editReply({ content: 'Gruplar listelenirken bir hata oluştu.' });
            }

            const groups = groupResponse.data.data.slice(0, 25); // İlk 25 grubu al

            const embed = new EmbedBuilder()
                .setTitle('Kullanıcı Grupları')
                .setDescription(`${username} adlı kullanıcının bulunduğu gruplar:`)
                .setColor('#00FF00')
                .setTimestamp();

            groups.forEach(group => {
                embed.addFields({ name: group.group.name, value: `Rol: ${group.role.name}`, inline: true });
            });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Gruplar listelenirken bir hata oluştu.' });
        }
    },
};
