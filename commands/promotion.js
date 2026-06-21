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

const CHANNEL_ID = "1518046838635237427";

// =========================

module.exports = {
    data: new SlashCommandBuilder()
        .setName("promotion")
        .setDescription("Send a staff promotion.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Member")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("oldrank")
                .setDescription("Previous rank")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("newrank")
                .setDescription("New rank")
                .setRequired(true)
        )
         .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the infraction")
                .setRequired(true)
        ),

    async execute(interaction) {

        const hasRole = ALLOWED_ROLES.some(roleId =>
            interaction.member.roles.cache.has(roleId)
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

        const channel = interaction.guild.channels.cache.get(CHANNEL_ID);

        if (!channel) {
            return interaction.reply({
                content: "❌ Promotion channel not found.",
                ephemeral: true
            });
        }

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
`Member
${user}
Previous Rank
${oldRank}
New Rank
${newRank}
Reason
${reason}
Promoted By
${interaction.user}

### Date
<t:${Math.floor(Date.now() / 1000)}:F>`
                    )
            );

        await channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        await interaction.reply({
            content: "✅ Promotion sent successfully.",
            ephemeral: true
        });
    }
};
