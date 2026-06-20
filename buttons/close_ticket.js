const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    ContainerBuilder,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    SeparatorBuilder,
    MessageFlags
} = require("discord.js");

const fetch = require("node-fetch");
const config = require("../config");

module.exports = {
    customId: "close_ticket",

    async execute(interaction) {

        const member = interaction.member;
        const ticketOwnerId = interaction.channel.topic;

        // =========================
        // PERMISSION CHECK
        // =========================

        const isOwner = interaction.user.id === ticketOwnerId;

        const isStaff = member.permissions.has(
            PermissionsBitField.Flags.ManageChannels
        );

        if (!isOwner && !isStaff) {
            return interaction.reply({
                content: "❌ You cannot close this ticket.",
                ephemeral: true
            });
        }

        // =========================
        // PREVENT DOUBLE CLOSE
        // =========================

        if (interaction.channel.closing) {
            return interaction.reply({
                content: "⚠️ This ticket is already closing.",
                ephemeral: true
            });
        }

        interaction.channel.closing = true;

        // =========================
        // DISABLE BUTTON
        // =========================

        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("close_ticket")
                .setLabel("Closing...")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)
        );

        await interaction.update({
            components: interaction.message.components.map(c => {
                if (c.components?.some(b => b.customId === "close_ticket")) {
                    return disabledRow;
                }
                return c;
            })
        }).catch(() => {});

        // =========================
        // ACK
        // =========================

        await interaction.followUp({
            content: "🔒 Closing ticket...",
            ephemeral: true
        });

        try {

            // =========================
            // TRANSCRIPT API
            // =========================

            const url = "https://api.cookie-api.com/api/transcript";

            const headers = {
                "Content-Type": "application/json"
            };

            const data = {
                bot_token: config.token
            };

            const params = new URLSearchParams({
                Authorization: config.cookieApiKey,
                channel_id: interaction.channel.id
            });

            const response = await fetch(`${url}?${params}`, {
                method: "POST",
                headers,
                body: JSON.stringify(data)
            });

            const transcriptData = await response.json();

            const transcriptUrl =
                transcriptData.url ||
                transcriptData.link ||
                transcriptData.transcript ||
                "https://cookie-api.com";

            // =========================
            // BUTTON
            // =========================

            const transcriptButton =
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("View Transcript")
                        .setStyle(ButtonStyle.Link)
                        .setURL(transcriptUrl)
                );

            // =========================
            // LOG
            // =========================

            const logContainer = new ContainerBuilder()
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems({
                        media: { url: config.tickettop || config.topBanner }
                    })
                )
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
`# Ticket Closed

- Ticket: ${interaction.channel.name}
- Closed By: <@${interaction.user.id}>
- Owner: <@${ticketOwnerId}>`
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder())
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems({
                        media: { url: config.ticketbottom || config.bottomBanner }
                    })
                );

            if (config.transcriptChannelId) {
                const logChannel = interaction.guild.channels.cache.get(
                    config.transcriptChannelId
                );

                if (logChannel) {
                    await logChannel.send({
                        flags: MessageFlags.IsComponentsV2,
                        components: [logContainer, transcriptButton]
                    });
                }
            }

            // =========================
            // DM USER
            // =========================

            const user = await interaction.client.users.fetch(ticketOwnerId).catch(() => null);

            if (user) {
                await user.send({
                    components: [
                        new ContainerBuilder().addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                `# Your Ticket Was Closed\n\n- Ticket: ${interaction.channel.name}`
                            )
                        )
                    ]
                }).catch(() => {});
            }

        } catch (err) {
            console.error("Close Ticket Error:", err);
        }

        setTimeout(async () => {
            await interaction.channel.delete().catch(() => {});
        }, 5000);
    }
};