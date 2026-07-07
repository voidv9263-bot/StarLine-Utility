const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MediaGalleryBuilder,
    MessageFlags
} = require("discord.js");

const config = require("../config");

module.exports = {
    customId: "guidelines",

    async execute(interaction) {

        const container = new ContainerBuilder()

            // Top Banner
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

            // Prices
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`
# Royal Dominion Guidelines

1. No spamming. This includes begging, copypastas, and text walls.

2. No inappropriate content. This includes NSFW material of any kind, excessive profanity, racial slurs, flashing images, and gifs that crash discord clients.

3. No advertising. This includes DM'ing random people in the server with advertisements/invites to other servers.

4. No doxxing. Do not reveal other people's real life info/photos without permission.

5. Do not fight, debate, harass, or start drama with other users. Keep it in DMs.

6. Do not bait members into breaking the rules.

7. **No stealing accounts.** This pertains to sending people fake links with account stealers/ loggers. If you're caught sending people loggers, you will be banned.

8. **Before using a channel, make sure to check the pins** to see if there are any additional rules or clarifications for that channel.

9. **Evading mutes/bans will result in further disciplinary action.**

10. **Do not look for loopholes/technicalities in these rules.** We believe these rules are pretty clear and should give you a good idea of what's acceptable vs. what isn't. As such, do not try to sneak around them by pushing their limits. If you do not understand one of these rules, feel free to ask our Helpers to explain.

`)
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            // Bottom Banner
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems({
                    media: {
                        url: config.shopbottom
                    }
                })
            );

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            components: [container]
        });
    }
};
