const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} = require("discord.js");

const config = require("../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("closerequest")
        .setDescription("Request to close this ticket"),

    async execute(interaction) {
        const channel = interaction.channel;

        const allowedCategories = Object.values(config.ticketCategories).map(c => c.categoryId);
        const allowedRoles = Object.values(config.ticketCategories).map(c => c.roleId);

        if (!channel.parentId || !allowedCategories.includes(channel.parentId)) {
            return interaction.reply({
                content: "❌ This command can only be used in tickets.",
                flags: MessageFlags.Ephemeral
            });
        }

        if (!interaction.member.roles.cache.some(r => allowedRoles.includes(r.id))) {
            return interaction.reply({
                content: "❌ You don't have permission.",
                flags: MessageFlags.Ephemeral
            });
        }

        const ownerId = channel.topic;

        if (!ownerId) {
            return interaction.reply({
                content: "❌ Ticket owner not found.",
                flags: MessageFlags.Ephemeral
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("close_confirm")
                .setLabel("Close Ticket")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("close_deny")
                .setLabel("Deny Request")
                .setStyle(ButtonStyle.Secondary)
        );

        // =========================
        // COMPONENTS V2 EDIT
        // =========================
        return interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
                {
                    type: 17, // Container
                    components: [
                        {
                            type: 10, // Text display
                            content: `## Ticket Close Request`
                        },
                        {
                            type: 14, // Separator
                            divider: true
                        },
                        {
                            type: 10,
                            content:
                                `**Ticket Owner:** <@${ownerId}>\n` +
                                `**Requested By:** <@${interaction.user.id}>\n\n`
                        }
                    ]
                },
                {
                    type: 1, // Action row (buttons still normal Discord component)
                    components: row.components
                }
            ]
        });
    }
};