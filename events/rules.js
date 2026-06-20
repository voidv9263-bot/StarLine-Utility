const {
    Events,

    ContainerBuilder,
    MediaGalleryBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,

    MessageFlags
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const config = require("../config");

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {

        const channel = await client.channels.fetch(config.rulesChannelId).catch(() => null);

        if (!channel) {
            return console.log("Rules channel not found.");
        }

        const savePath = path.join(__dirname, "../data/rulesMessage.json");

        if (!fs.existsSync(path.join(__dirname, "../data"))) {
            fs.mkdirSync(path.join(__dirname, "../data"));
        }

        let savedData = null;

        if (fs.existsSync(savePath)) {
            savedData = JSON.parse(fs.readFileSync(savePath, "utf8"));
        }

        if (savedData?.messageId) {
            const existingMessage = await channel.messages
                .fetch(savedData.messageId)
                .catch(() => null);

            if (existingMessage) {
                console.log("Rules embed already exists. Skipping.");
                return;
            }
        }

        const container = new ContainerBuilder()

            // TOP BANNER
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems({
                    media: {
                        url: config.topBanner
                    }
                })
            )

            // SPACE
            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            // MAIN TEXT
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
`# StarLine Rules

**1. Advertising**Advertising or self-promotion is not allowed without staff approval. This includes other servers, services, products, or personal content.

**2. Spam**Spamming is not permitted. Repeated messages, excessive emojis, mass mentions, or posting the same content multiple times will be moderated.

**3. Harassment & Hate Speech**Profanity is allowed. Harassment, hate speech, slurs, threats, or discriminatory language are not allowed under any circumstances.

**4. Drama**Public arguments and disruptive behavior are not allowed. Handle issues privately or through proper support channels.

**5. Mentions & Staff Contact**Do not unnecessarily ping or directly message staff. Use the appropriate channels and follow the chain of command.

**6. Respect**Treat everyone with respect. Hostile or abusive behavior toward others will result in action.

**7. Common Sense** Use common sense at all times. Do not engage in actions that are careless, disruptive, or intentionally harmful.

**8. Platform Rules**Follow [Discord’s Terms of Service](https://discord.com/terms) at all times. Any behavior that breaks platform rules or harms the community is prohibited.

*These rules are not exhaustive and apply to all activity within this server. Staff reserve the right to make final decisions regarding enforcement and punishment.*`
                )
            )

            // SPACE
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

        console.log("Rules embed sent.");
    }
};
