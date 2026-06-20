const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const config = require("../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Remove a user from this ticket")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to remove")
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
            await channel.permissionOverwrites.delete(user.id);

            return interaction.reply({
                content: `Removed ${user} from the ticket.`,
                flags: MessageFlags.Ephemeral
            });

        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "Failed to remove user.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};