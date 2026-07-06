const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MediaGalleryBuilder,
    MessageFlags
} = require("discord.js");

const config = require("../config");

module.exports = {
    customId: "shop_prices",

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
# 💰 StarLine Shop Prices

## ⚔️ Swords
• Item 1 — **$5**
• Item 2 — **$10**

## 🔥 V4
• Full V4 — **$15**
• Trial — **$8**

## 🏝️ Raids
• Normal Raid — **$3**
• Advanced Raid — **$6**

## 📌 Information
• Payments are handled only through official staff.
• Prices are subject to change.
• Open a shop ticket to purchase.
`)
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            // Bottom Banner
            .addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems({
                    media: {
                        url: config.shopBanner
                    }
                })
            );

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            components: [container]
        });
    }
};
