const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

const groupId = '33282262'; 

async function fetchWithRetry(url, options, retries = 3) {
    try {
        return await axios(url, options);
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle ve yeniden dene
        return fetchWithRetry(url, options, retries - 1);
    }
}

async function getAllGroupMembers() {
    let members = [];
    let cursor = '';

    do {
        const response = await fetchWithRetry(`https://groups.roblox.com/v1/groups/${groupId}/users?limit=100&cursor=${cursor}`);
        members = members.concat(response.data.data);
        cursor = response.data.nextPageCursor;
    } while (cursor);

    return members;
}

function filterMembersByRank(members, rank, includeHigher) {
    return members.filter(member => includeHigher ? member.role.rank >= rank : member.role.rank === rank);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('üye-listele')
        .setDescription('Belirtilen rütbeye sahip grup üyelerini listeler.')
        .addIntegerOption(option => option.setName('rutbe').setDescription('Rütbe ID\'si').setRequired(true))
        .addBooleanOption(option => option.setName('ust-dahilmi').setDescription('Üst rütbeleri de dahil et').setRequired(true)),
    async execute(interaction) {
        const rank = interaction.options.getInteger('rutbe');
        const includeHigher = interaction.options.getBoolean('ust-dahilmi');

        try {
            await interaction.deferReply();

            const members = await getAllGroupMembers();
            const filteredMembers = filterMembersByRank(members, rank, includeHigher);

            const pages = [];
            for (let i = 0; i < filteredMembers.length; i += 25) {
                const pageMembers = filteredMembers.slice(i, i + 25);
                const description = pageMembers.map(member => `${member.user.username} (${member.user.userId}) - Rütbe: ${member.role.rank}`).join('\n');

                if (description.length === 0) {
                    description = 'Bu rütbede veya üstünde üye bulunamadı.';
                }

                const embed = new EmbedBuilder()
                    .setTitle('Üye Listesi')
                    .setDescription(description)
                    .setColor('#00FF00');
                pages.push(embed);
            }

            let currentPage = 0;

            const getRow = (currentPage) => {
                return new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('⬅️ Önceki')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('➡️ Sonraki')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === pages.length - 1)
                    );
            };

            const message = await interaction.editReply({ embeds: [pages[currentPage]], components: [getRow(currentPage)] });

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'previous') {
                    currentPage--;
                } else if (i.customId === 'next') {
                    currentPage++;
                }
                await i.update({ embeds: [pages[currentPage]], components: [getRow(currentPage)] });
            });

            collector.on('end', async () => {
                await message.edit({ components: [] });
            });
        } catch (error) {
            console.error('Üye listeleme sırasında bir hata oluştu:', error);
            await interaction.editReply({ content: 'Üye listeleme sırasında bir hata oluştu.', ephemeral: true });
        }
    },
};
