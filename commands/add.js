const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const config = require("../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("add")
        .setDescription("Add a user to this ticket")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to add")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const channel = interaction.channel;

        const allowedCategories = Object.values(config.ticketCategories).map(c => c.categoryId);
        const allowedRoles = Object.values(config.ticketCategories).map(c => c.roleId);

        if (!channel.parentId || !allowedCategories.includes(channel.parentId)) {
            return interaction.reply({
                content: "This command can only be used in tickets.",
                flags: MessageFlags.Ephemeral
            });
        }

        if (!interaction.member.roles.cache.some(r => allowedRoles.includes(r.id))) {
            return interaction.reply({
                content: "You do not have permission.",
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            await channel.permissionOverwrites.edit(user.id, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true
            });

            return interaction.reply({
                content: `Added ${user} to the ticket.`,
                flags: MessageFlags.Ephemeral
            });

        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "Failed to add user.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};