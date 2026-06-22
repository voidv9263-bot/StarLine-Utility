const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags
} = require("discord.js");

const fetch = require("node-fetch");
const config = require("../config");

async function closeTicket(interaction) {

    try {

        const ticketOwnerId = interaction.channel.topic;

        // =========================
        // CREATE TRANSCRIPT
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
        // TRANSCRIPT BUTTON
        // =========================

        const transcriptButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("View Transcript")
                .setStyle(ButtonStyle.Link)
                .setURL(transcriptUrl)
        );

        // =========================
        // LOG CONTAINER
        // =========================

        const logContainer = new ContainerBuilder()
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems({
                    media: {
                        url: config.tickettop || config.topBanner
                    }
                })
            )
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
`# Ticket Closed

### Ticket Information

- Ticket: ${interaction.channel.name}
- Ticket Owner: <@${ticketOwnerId}>`
                )
            )
            .addSeparatorComponents(new SeparatorBuilder())
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems({
                    media: {
                        url: config.ticketbottom || config.bottomBanner
                    }
                })
            );

        // =========================
        // SEND LOG
        // =========================

        const logChannel =
            interaction.guild.channels.cache.get(config.transcriptChannelId);

        if (logChannel) {
            await logChannel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [logContainer, transcriptButton]
            });
        }

        // =========================
        // DM USER
        // =========================

        const user = await interaction.client.users
            .fetch(ticketOwnerId)
            .catch(() => null);

        if (user) {

            const dmContainer = new ContainerBuilder()
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems({
                        media: {
                            url: config.tickettop || config.topBanner
                        }
                    })
                )
                .addSeparatorComponents(new SeparatorBuilder())
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
`# Your Ticket Has Been Closed

### Ticket Information

- Ticket: ${interaction.channel.name}
- Closed By: <@${interaction.user.id}>

Thank you for opening a ticket.`
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder())
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems({
                        media: {
                            url: config.ticketbottom || config.bottomBanner
                        }
                    })
                );

            await user.send({
                flags: MessageFlags.IsComponentsV2,
                components: [dmContainer, transcriptButton]
            }).catch(() => {});
        }

    } catch (err) {
        console.error("Cookie API Error:", err);
    }

    // =========================
    // DELETE CHANNEL
    // =========================

    setTimeout(async () => {
        await interaction.channel.delete().catch(() => {});
    }, 5000);
}

module.exports = { closeTicket };
