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
            .fetch(config.ticketPanelChannel)
            .catch(() => null);

        if (!channel) {
            return console.log("Ticket panel channel not found.");
        }

        // =========================
        // SAVE FILE
        // =========================

        const dataFolder = path.join(__dirname, "../data");

        if (!fs.existsSync(dataFolder)) {
            fs.mkdirSync(dataFolder);
        }

        const savePath = path.join(dataFolder, "ticketPanel.json");

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
                console.log("Ticket panel already exists.");
                return;
            }
        }

        // =========================
        // SELECT MENU
        // =========================

        const select = new StringSelectMenuBuilder()
            .setCustomId("ticket_create")
            .setPlaceholder("Select a ticket category")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("General Support")
                    .setDescription("Open a general support ticket")
                    .setValue("general"),
            );

       const selectRow = new ActionRowBuilder().addComponents(select);

        // =========================
        // PRICES BUTTON
        // =========================

        const informationButton = new ButtonBuilder()
            .setCustomId("guidelines")
            .setLabel("GuideLine")
            .setStyle(ButtonStyle.Secondary);

        const buttonRow = new ActionRowBuilder().addComponents(informationButton);

        // =========================
        // V2 CONTAINER
        // =========================

        const container = new ContainerBuilder()

            // TOP BANNER
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems({
                    media: {
                        url: config.tickettop
                    }
                })
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            // TEXT
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
`# Royal Dominion Information

Welcome to the Royal Dominion!
The best place to get any Blox Fruit accounts. Get stacked accounts, max-level everything you need, for a cheap price.

Royal Dominion was founded on <t:1783345620:D> by <@1457565195483353120> and <@961048718612774922>. They opened Royal Dominion to help people get stuff so they don't have to grind.
`)
            )

            .addSeparatorComponents(new SeparatorBuilder())

            // SELECT MENU ROW (MUST BE ACTION ROW)
            .addActionRowComponents(buttonRow)
             
            .addSeparatorComponents(new SeparatorBuilder())

            // BUTTON ROW (MUST BE SEPARATE ACTION ROW)
            .addActionRowComponents(selectRow)

            .addSeparatorComponents(new SeparatorBuilder())

            // BOTTOM BANNER
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems({
                    media: {
                        url: config.bottomBanner
                    }
                })
            );

        // =========================
        // SEND PANEL
        // =========================

        const message = await channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [container],
    allowedMentions: {
        parse: [] // Prevents all mentions (@everyone, @here, users, roles)
    }
});
        fs.writeFileSync(
            savePath,
            JSON.stringify({ messageId: message.id }, null, 4)
        );

        console.log("Ticket panel sent.");
    }
};
