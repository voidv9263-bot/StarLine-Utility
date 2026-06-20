const {
    SlashCommandBuilder,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    Events
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const config = require("../config");

const dataPath = path.join(__dirname, "../data/tickets.json");

function loadData() {
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// =========================
// SLASH COMMAND
// =========================

module.exports = {
    data: new SlashCommandBuilder()
        .setName("close")
        .setDescription("Close this ticket"),

    async execute(interaction) {
        const channel = interaction.channel;

        const data = loadData();
        const ticket = data[channel.id];

        const ticketOwnerId = ticket?.claimedBy || ticket?.ownerId || null;

        await interaction.reply({
            content: "Creating transcript and closing ticket...",
            flags: MessageFlags.Ephemeral
        });

        try {
            // =========================
            // CREATE TRANSCRIPT
            // =========================

            const url = "https://api.cookie-api.com/api/transcript";

            const params = new URLSearchParams({
                Authorization: config.cookieApiKey,
                channel_id: channel.id
            });

            const response = await fetch(`${url}?${params}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bot_token: config.token
                })
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

            const transcriptButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("View Transcript")
                    .setStyle(ButtonStyle.Link)
                    .setURL(transcriptUrl)
            );

            // =========================
            // LOG EMBED (COMPONENTS V2)
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

### Ticket Information

- Ticket: ${channel.name}
- Closed By: <@${interaction.user.id}>
- Ticket User: ${ticketOwnerId ? `<@${ticketOwnerId}>` : "Unknown"}`
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder())
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems({
                        media: { url: config.ticketbottom || config.bottomBanner }
                    })
                );

            // =========================
            // SEND TO LOG CHANNEL
            // =========================

            const logChannel = interaction.guild.channels.cache.get(
                config.transcriptChannelId
            );

            if (logChannel) {
                await logChannel.send({
                    flags: MessageFlags.IsComponentsV2,
                    components: [logContainer, transcriptButton]
                });
            }

            // =========================
            // DM USER
            // =========================

            if (ticketOwnerId) {
                const user = await interaction.client.users
                    .fetch(ticketOwnerId)
                    .catch(() => null);

                if (user) {
                    const dmContainer = new ContainerBuilder()
                        .addMediaGalleryComponents(
                            new MediaGalleryBuilder().addItems({
                                media: { url: config.tickettop || config.topBanner }
                            })
                        )
                        .addSeparatorComponents(new SeparatorBuilder())
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
`# Your Ticket Has Been Closed

### Ticket Information

- Ticket: ${channel.name}
- Closed By: <@${interaction.user.id}>`
                            )
                        )
                        .addSeparatorComponents(new SeparatorBuilder())
                        .addMediaGalleryComponents(
                            new MediaGalleryBuilder().addItems({
                                media: { url: config.ticketbottom || config.bottomBanner }
                            })
                        );

                    await user.send({
                        flags: MessageFlags.IsComponentsV2,
                        components: [dmContainer, transcriptButton]
                    }).catch(() => {});
                }
            }

            // =========================
            // CLEAN JSON
            // =========================

            delete data[channel.id];
            saveData(data);

            // =========================
            // DELETE CHANNEL
            // =========================

            setTimeout(async () => {
                await channel.delete().catch(() => {});
            }, 5000);

        } catch (err) {
            console.error("Close Ticket Error:", err);

            return interaction.followUp({
                content: "❌ Failed to close ticket.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};