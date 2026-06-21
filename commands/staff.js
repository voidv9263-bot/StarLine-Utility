const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags
} = require("discord.js");

// =========================
// CONFIG
// =========================

const ALLOWED_ROLES = [
    "1518046067558580326",
    "1518046228229783562",
    "1517580278376435882"
];

const INFRACTION_CHANNEL_ID = "1518046838635237427";
const PROMOTION_CHANNEL_ID = "1518046838635237427";

// =========================

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName("infraction")
            .setDescription("Send an infraction.")
            .addUserOption(option =>
                option
                    .setName("user")
                    .setDescription("Member")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName("action")
                    .setDescription("Action taken")
                    .setRequired(true)
                    .addChoices(
                        { name: "Warning", value: "Warning" },
                        { name: "Strike", value: "Strike" },
                        { name: "Suspension", value: "Suspension" },
                        { name: "Demotion", value: "Demotion" }
                    )
            )
            .addStringOption(option =>
                option
                    .setName("reason")
                    .setDescription("Reason")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const hasRole = ALLOWED_ROLES.some(role =>
                interaction.member.roles.cache.has(role)
            );

            if (!hasRole) {
                return interaction.reply({
                    content: "❌ You do not have permission to use this command.",
                    ephemeral: true
                });
            }

            const user = interaction.options.getUser("user");
            const action = interaction.options.getString("action");
            const reason = interaction.options.getString("reason");

            const channel = interaction.guild.channels.cache.get(INFRACTION_CHANNEL_ID);

            const container = new ContainerBuilder()

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent("# StarLine Infraction")
                )

                .addSeparatorComponents(
                    new SeparatorBuilder()
                )

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
`### Member
${user}

### Action
${action}

### Reason
${reason}

### Moderator
${interaction.user}

### Date
<t:${Math.floor(Date.now() / 1000)}:F>`
                        )
                );

            await channel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [container]
            });

            await interaction.reply({
                content: "✅ Infraction sent.",
                ephemeral: true
            });
        }
    },

    {
        data: new SlashCommandBuilder()
            .setName("promotion")
            .setDescription("Send a promotion.")
            .addUserOption(option =>
                option
                    .setName("user")
                    .setDescription("Member")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName("oldrank")
                    .setDescription("Old rank")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName("newrank")
                    .setDescription("New rank")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const hasRole = ALLOWED_ROLES.some(role =>
                interaction.member.roles.cache.has(role)
            );

            if (!hasRole) {
                return interaction.reply({
                    content: "❌ You do not have permission to use this command.",
                    ephemeral: true
                });
            }

            const user = interaction.options.getUser("user");
            const oldRank = interaction.options.getString("oldrank");
            const newRank = interaction.options.getString("newrank");

            const channel = interaction.guild.channels.cache.get(PROMOTION_CHANNEL_ID);

            const container = new ContainerBuilder()

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent("# StarLine Promotion")
                )

                .addSeparatorComponents(
                    new SeparatorBuilder()
                )

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
`### Member
${user}

### Previous Rank
${oldRank}

### New Rank
${newRank}

### Promoted By
${interaction.user}

### Date
<t:${Math.floor(Date.now() / 1000)}:F>`
                        )
                );

            await channel.send({
                flags: MessageFlags.IsComponentsV2,
                components: [container]
            });

            await interaction.reply({
                content: "✅ Promotion sent.",
                ephemeral: true
            });
        }
    }
];
