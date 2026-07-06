const {
    Events,

    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,

    ContainerBuilder,
    MediaGalleryBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,

    ButtonBuilder,
    ButtonStyle,

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
            return console.log("Shop panel channel not found.");
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
        // CHECK EXISTING PANEL
        // =========================

        if (savedData?.messageId) {
            const existing = await channel.messages
                .fetch(savedData.messageId)
                .catch(() => null);

            if (existing) {
                console.log("Shop panel already exists.");
                return;
            }
        }

        // =========================
        // SELECT MENU
        // =========================

        const select = new StringSelectMenuBuilder()
            .setCustomId("shop_create")
            .setPlaceholder("Select a shop category...")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Swords and Guns")
                    .setDescription("Purchase swords and guns")
                    .setValue("swords"),

                new StringSelectMenuOptionBuilder()
                    .setLabel("V4")
                    .setDescription("Purchase V4 services")
                    .setValue("v4"),

                new StringSelectMenuOptionBuilder()
                    .setLabel("Raids")
                    .setDescription("Purchase raid services")
                    .setValue("raids")
            );

        const selectRow = new ActionRowBuilder().addComponents(select);

        // =========================
        // PRICES BUTTON
        // =========================

        const pricesButton = new ButtonBuilder()
            .setCustomId("shop_prices")
            .setLabel("Prices")
            .setStyle(ButtonStyle.Secondary);

        const buttonRow = new ActionRowBuilder().addComponents(pricesButton);

        // =========================
        // CONTAINER V2
        // =========================

        const container = new ContainerBuilder()

            // TOP IMAGE
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems({
                    media: {
                        url: config.shoptop
                    }
                })
            )

            .addSeparatorComponents(new SeparatorBuilder())

            // TEXT
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
`# Royal Dominion Shop

Welcome to the Royal Dominion Shop!|

Purchase services quickly and securely by opening a shop ticket.

Cashapps
[ydktrey Cashapp](https://cash.app/$treyneverlackin)
[Johns Cashapp](https://cash.app/$pikebentley)

Robloxs
MarshallZL1
pikebentley

## Available Categories
• Swords and Guns
• V4 Services
• Raids

## Before Opening a Ticket
• Select the correct category
• Explain what you want clearly
• Wait for staff assistance
• Payments are handled only by staff

Use the menu below to open a ticket.

Click **Prices** to view pricing information.`
                )
            )

            .addSeparatorComponents(new SeparatorBuilder())

            // SELECT MENU ROW (MUST BE ACTION ROW)
            .addActionRowComponents(selectRow)

            // BUTTON ROW (MUST BE SEPARATE ACTION ROW)
            .addActionRowComponents(buttonRow)

            .addSeparatorComponents(new SeparatorBuilder())

            // BOTTOM IMAGE
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems({
                    media: {
                        url: config.shopbottom
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
            JSON.stringify(
                { messageId: message.id },
                null,
                4
            )
        );

        console.log("Shop panel sent.");
    }
};
