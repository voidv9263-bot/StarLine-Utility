const {
    Events,

    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,

    ContainerBuilder,
    MediaGalleryBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,

    MessageFlags
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const config = require("../config");

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {

        const channel = await client.channels
            .fetch(config.shopPanelChannel)
            .catch(() => null);

        if (!channel) {
            return console.log("shop panel channel not found.");
        }

        // =========================
        // SAVE FILE
        // =========================

        const dataFolder = path.join(__dirname, "../data");

        if (!fs.existsSync(dataFolder)) {
            fs.mkdirSync(dataFolder);
        }

        const savePath = path.join(dataFolder, "shopPanel.json");

        let savedData = null;

        if (fs.existsSync(savePath)) {
            savedData = JSON.parse(fs.readFileSync(savePath, "utf8"));
        }

        // =========================
        // CHECK IF PANEL EXISTS
        // =========================

        if (savedData?.messageId) {
            const existing = await channel.messages
                .fetch(savedData.messageId)
                .catch(() => null);

            if (existing) {
                console.log("shop panel already exists.");
                return;
            }
        }

        // =========================
        // SELECT MENU
        // =========================

        const select = new StringSelectMenuBuilder()
            .setCustomId("shop_create")
            .setPlaceholder("Select a shop category")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Swords")
                    .setDescription("Open a Sword Shop ticket")
                    .setValue("swords"),

                new StringSelectMenuOptionBuilder()
                    .setLabel("V4")
                    .setDescription("Open a V4 shopticket")
                    .setValue("v4"),

                new StringSelectMenuOptionBuilder()
                    .setLabel("Raids")
                    .setDescription("Open a Raid Shop ticket")
                    .setValue("raids")
            );

        const selectRow = new ActionRowBuilder().addComponents(select);

        // =========================
        // V2 CONTAINER
        // =========================

        const container = new ContainerBuilder()

            // TOP BANNER
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems({
                    media: {
                        url: config.shoptop
                    }
                })
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            // TEXT
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
`# StarLine Support

Welcome to the StarLine Support Server!

Need help with StarLine? Open a support ticket, and our team will assist you as soon as possible.

Use tickets for:
• Bot setup and configuration
• to Report bugs or issues do /bug-report
• Command assistance
• Feature requests and suggestions
• Questions about StarLine's features
• General support

Before opening a ticket:
• Clearly explain your issue.
• Include screenshots or error messages if possible.
• Be respectful and patient while waiting for a response.

Click the button below to create a private support ticket. A member of the StarLine support team will be with you shortly. ✨`
                )
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            // SELECT MENU INSIDE CONTAINER
            .addActionRowComponents(selectRow)

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            // BOTTOM BANNER
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems({
                    media: {
                        url: config.shopBanner
                    }
                })
            );

        // =========================
        // SEND PANEL
        // =========================

        const message = await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        });

        fs.writeFileSync(
            savePath,
            JSON.stringify({ messageId: message.id }, null, 4)
        );

        console.log("Ticket panel sent.");
    }
};
