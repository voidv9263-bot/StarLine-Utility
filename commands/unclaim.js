const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const dataPath = path.join(__dirname, "../data/tickets.json");

function loadData() {
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unclaim")
        .setDescription("Unclaim this ticket"),

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

        const data = loadData();
        const ticket = data[channel.id];

        // Not claimed
        if (!ticket) {
            return interaction.reply({
                content: "❌ This ticket is not claimed.",
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            const originalName = ticket.originalName || channel.name;

            // Restore channel name
            await channel.setName(originalName);

            // Remove from JSON
            delete data[channel.id];
            saveData(data);

            return interaction.reply({
                content: `${interaction.user} has unclaimed this ticket.`
            });

        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "❌ Failed to unclaim ticket.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};