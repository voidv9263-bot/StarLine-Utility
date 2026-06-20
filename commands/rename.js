const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const config = require("../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rename")
        .setDescription("Rename the current ticket channel")
        .addStringOption(option =>
            option
                .setName("name")
                .setDescription("New ticket name")
                .setRequired(true)
        ),

    async execute(interaction) {
        const newName = interaction.options.getString("name");
        const channel = interaction.channel;

        // =========================
        // CATEGORY CHECK (TICKET ONLY)
        // =========================
        const allowedCategories = Object.values(config.ticketCategories).map(c => c.categoryId);

        if (!channel.parentId || !allowedCategories.includes(channel.parentId)) {
            return interaction.reply({
                content: "This command can only be used inside a ticket.",
                flags: MessageFlags.Ephemeral
            });
        }

        // =========================
        // ROLE CHECK (SUPPORT ONLY)
        // =========================
        const allowedRoles = Object.values(config.ticketCategories).map(c => c.roleId);

        const memberRoles = interaction.member.roles.cache;

        const hasPermission = allowedRoles.some(roleId => memberRoles.has(roleId));

        if (!hasPermission) {
            return interaction.reply({
                content: "You do not have permission to rename this ticket.",
                flags: MessageFlags.Ephemeral
            });
        }

        // =========================
        // RENAME CHANNEL
        // =========================
        try {
            await channel.setName(newName);

            return interaction.reply({
                content: `Ticket renamed to **${newName}**`,
                flags: MessageFlags.Ephemeral
            });
        } catch (err) {
            console.error("Rename error:", err);

            return interaction.reply({
                content: "Failed to rename the ticket.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};