const {
    Events,

    ChannelType,
    PermissionsBitField,

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

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {

        // =========================
        // DROPDOWN
        // =========================

        if (interaction.isStringSelectMenu()) {

            if (interaction.customId !== "ticket_create") return;

            let categoryId;
            let roleId;
            let ticketName;

            // =========================
            // CATEGORY TYPES
            // =========================

            if (interaction.values[0] === "general") {
                categoryId = config.ticketCategories.general.categoryId;
                roleId = config.ticketCategories.general.roleId;
                ticketName = "general";
            }

            // =========================
            // CHECK EXISTING TICKET
            // =========================

            const existingChannel = interaction.guild.channels.cache.find(
                c =>
                    c.name === `${ticketName}-${interaction.user.username.toLowerCase()}`
            );

            if (existingChannel) {
                return interaction.reply({
                    content: `You already have a ticket open: ${existingChannel}`,
                    ephemeral: true
                });
            }

            // =========================
            // CREATE CHANNEL
            // =========================

            const channel = await interaction.guild.channels.create({
                name: `${ticketName}-${interaction.user.username.toLowerCase()}`,

                type: ChannelType.GuildText,

                parent: categoryId,

                topic: interaction.user.id,

                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },

                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    },

                    {
                        id: roleId,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    }
                ]
            });

            // =========================
            // CLOSE BUTTON
            // =========================

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("Close Ticket")
                    .setStyle(ButtonStyle.Danger)
            );

            // =========================
            // COMPONENTS V2
            // =========================

            const container = new ContainerBuilder()

                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems({
                        media: {
                            url: config.tickettop || config.topBanner
                        }
                    })
                )

                .addSeparatorComponents(
                    new SeparatorBuilder()
                )

                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
`Thank you <@${interaction.user.id}> for opening a ticket. A member of our <@&${roleId}> will be with you as soon as possible.

While you wait, please provide the following information:

• Roblox Username
• Discord Username
• Reason for Opening the Ticket
• Any Relevant Screenshots or Evidence

-# Please be patient and avoid pinging staff unnecessarily. We will assist you as soon as someone is available.`
                    )
                )

                .addSeparatorComponents(
                    new SeparatorBuilder()
                )

                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems({
                        media: {
                            url: config.ticketbottom || config.bottomBanner
                        }
                    })
                );

            // =========================
            // SEND MESSAGE
            // =========================

            await channel.send({
                flags: MessageFlags.IsComponentsV2,

                components: [
                    container,
                    closeRow
                ]
            });

            // =========================
            // AUTO CLOSE IF USER LEAVES
            // =========================

            const interval = setInterval(async () => {

                const member = await interaction.guild.members
                    .fetch(interaction.user.id)
                    .catch(() => null);

                // USER LEFT SERVER
                if (!member) {

                    clearInterval(interval);

                    try {

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
                            channel_id: channel.id
                        });

                        const response = await fetch(`${url}?${params}`, {
                            method: "POST",
                            headers,
                            body: JSON.stringify(data)
                        });

                        const transcriptData = await response.json();

                        console.log(transcriptData);

                        const transcriptUrl =
                            transcriptData.url ||
                            transcriptData.link ||
                            transcriptData.transcript ||
                            "https://cookie-api.com";

                        // =========================
                        // TRANSCRIPT BUTTON
                        // =========================

                        const transcriptButton =
                            new ActionRowBuilder().addComponents(
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

                            .addSeparatorComponents(
                                new SeparatorBuilder()
                            )

                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(
`# Ticket Automatically Closed

### Ticket Information

- Ticket: ${channel.name}
- Reason: User Left Server
- Ticket Owner: <@${interaction.user.id}>`
                                )
                            )

                            .addSeparatorComponents(
                                new SeparatorBuilder()
                            )

                            .addMediaGalleryComponents(
                                new MediaGalleryBuilder().addItems({
                                    media: {
                                        url: config.ticketbottom || config.bottomBanner
                                    }
                                })
                            );

                        // =========================
                        // SEND TO LOG CHANNEL
                        // =========================

                        if (config.transcriptChannelId) {

                            const logChannel =
                                interaction.guild.channels.cache.get(
                                    config.transcriptChannelId
                                );

                            if (logChannel) {

                                await logChannel.send({
                                    flags: MessageFlags.IsComponentsV2,

                                    components: [
                                        logContainer,
                                        transcriptButton
                                    ]
                                });
                            }
                        }

                        // =========================
                        // DM USER TRANSCRIPT
                        // =========================

                        const user = await interaction.client.users
                            .fetch(interaction.user.id)
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

                                .addSeparatorComponents(
                                    new SeparatorBuilder()
                                )

                                .addTextDisplayComponents(
                                    new TextDisplayBuilder().setContent(
`# Your Ticket Was Automatically Closed

### Ticket Information

- Ticket: ${channel.name}
- Reason: You Left The Server`
                                    )
                                )

                                .addSeparatorComponents(
                                    new SeparatorBuilder()
                                )

                                .addMediaGalleryComponents(
                                    new MediaGalleryBuilder().addItems({
                                        media: {
                                            url: config.ticketbottom || config.bottomBanner
                                        }
                                    })
                                );

                            await user.send({
                                flags: MessageFlags.IsComponentsV2,

                                components: [
                                    dmContainer,
                                    transcriptButton
                                ]
                            }).catch(() => {});
                        }

                    } catch (err) {

                        console.error("Auto Close Transcript Error:", err);
                    }

                    // =========================
                    // DELETE CHANNEL
                    // =========================

                    setTimeout(async () => {

                        await channel.delete().catch(() => {});

                    }, 5000);
                }

            }, 10000);

            // =========================
            // REPLY
            // =========================

            return interaction.reply({
                content: `Your ticket has been created: ${channel}`,
                ephemeral: true
            });
        }

        // =========================
        // CLOSE BUTTON
        // =========================

        if (interaction.isButton()) {

            if (interaction.customId !== "close_ticket") return;

            await interaction.reply({
                content: "Creating transcript and closing ticket...",
                ephemeral: true
            });

            try {

                const ticketOwnerId = interaction.channel.topic;

                const ticketOwner =
                    await interaction.guild.members.fetch(ticketOwnerId)
                    .catch(() => null);

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

                console.log(transcriptData);

                const transcriptUrl =
                    transcriptData.url ||
                    transcriptData.link ||
                    transcriptData.transcript ||
                    "https://cookie-api.com";

                // =========================
                // TRANSCRIPT BUTTON
                // =========================

                const transcriptButton =
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel("View Transcript")
                            .setStyle(ButtonStyle.Link)
                            .setURL(transcriptUrl)
                    );

                // =========================
                // COMPONENTS V2 LOG
                // =========================

                const logContainer = new ContainerBuilder()

                    .addMediaGalleryComponents(
                        new MediaGalleryBuilder().addItems({
                            media: {
                                url: config.tickettop || config.topBanner
                            }
                        })
                    )

                    .addSeparatorComponents(
                        new SeparatorBuilder()
                    )

                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
`# Ticket Closed

### Ticket Information

- Ticket: ${interaction.channel.name}
- Ticket Owner: <@${ticketOwnerId}>`
                        )
                    )

                    .addSeparatorComponents(
                        new SeparatorBuilder()
                    )

                    .addMediaGalleryComponents(
                        new MediaGalleryBuilder().addItems({
                            media: {
                                url: config.ticketbottom || config.bottomBanner
                            }
                        })
                    );

                // =========================
                // SEND TO LOG CHANNEL
                // =========================

                if (config.transcriptChannelId) {

                    const logChannel =
                        interaction.guild.channels.cache.get(
                            config.transcriptChannelId
                        );

                    if (logChannel) {

                        await logChannel.send({
                            flags: MessageFlags.IsComponentsV2,

                            components: [
                                logContainer,
                                transcriptButton
                            ]
                        });
                    }
                }

                // =========================
                // DM USER TRANSCRIPT
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

                        .addSeparatorComponents(
                            new SeparatorBuilder()
                        )

                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
`# Your Ticket Has Been Closed

### Ticket Information

- Ticket: ${interaction.channel.name}
- Closed By: <@${interaction.user.id}>

Thank you for opening a ticket.`
                            )
                        )

                        .addSeparatorComponents(
                            new SeparatorBuilder()
                        )

                        .addMediaGalleryComponents(
                            new MediaGalleryBuilder().addItems({
                                media: {
                                    url: config.ticketbottom || config.bottomBanner
                                }
                            })
                        );

                    await user.send({
                        flags: MessageFlags.IsComponentsV2,

                        components: [
                            dmContainer,
                            transcriptButton
                        ]
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
    }
};
