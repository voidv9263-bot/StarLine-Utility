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
# 💰 Royal Dominion Prices

## ⚔️ Swords
• Shark Anchor - $2
• True Triple Katana - $4
• Cursed Dual Katana - $5
• Guns
• Soul Guitar - $2
• Acidium Rifle - $3
• Kabucha - $1
• Fighting Styles
• God Human - $3
• Super Human - $1

## 🔫 Guns
• Soul Guitar - $2
• Acidium Rifle - $3
• Kabucha - $1
• Fighting Styles
• God Human - $3
• Super Human - $1

## 🔥 V4
• Human - $3
• Shark - $3
• Mink - $3
• Angel- $3
• Cyborg- $4
• Ghoul  - $4
• Draco - $7

## 🏝️ Raids
• 1 raid - 1 legendary fruit
• 5 raids - 1 mythical fruit 
• 10 raids - 2 mythical fruits
• 15 raids - 3 mythical fruits
• 20 raids - 4 mythical fruits 
• 50 raids - 9 mythical fruits

## 🏝️ Law Raids
• 1 - 1 high-tier Legendary
• 4+ 2 mythical fruits 

## 📌 Information
• Payments are taken in Robux or CashApp
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
