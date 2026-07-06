const {
    Events,

    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,

    ContainerBuilder,
    MediaGalleryBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
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
        // CHECK IF PANEL EXISTS
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
        // SHOP SELECT MENU
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

        // =========================
        // PRICES BUTTON
        // =========================

        const pricesButton = new ButtonBuilder()
            .setCustomId("shop_prices")
            .setLabel("Prices")
            .setStyle(ButtonStyle.Secondary);

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
`# Royal Dominion Shop

Welcome to the Royal Dominion Shop!

Purchase our in-game services quickly and securely by opening a shop ticket.

## Available Categories
• Swords and Guns
• V4 Services
• Raids

## Before Opening a Ticket
• Select the correct category.
• Explain exactly what you'd like to purchase.
• Wait for a staff member to assist you.
• Payments are handled only through official staff.

Use the menu below to open a private shop ticket.

Need to see our pricing first? Click the **Prices** button below.`
                )
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            // SELECT MENU
            .addActionRowComponents(select)

            // PRICES BUTTON
            .addActionRowComponents(pricesButton)

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            // BOTTOM BANNER
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
                {
                    messageId: message.id
                },
                null,
                4
            )
        );

        console.log("Shop panel sent.");
    }
};
