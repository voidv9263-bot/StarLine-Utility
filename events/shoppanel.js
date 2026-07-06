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

                new StringSelectMenuOptionBuilder()
                    .setLabel("Developer Support")
                    .setDescription("Open a developer support ticket")
                    .setValue("developer"),

                new StringSelectMenuOptionBuilder()
                    .setLabel("Bug Report")
                    .setDescription("Open a Bug Report ticket")
                    .setValue("bugreport")
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
                        url: config.bottomBanner
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
