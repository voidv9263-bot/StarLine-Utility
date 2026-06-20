const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const CLAIM_PREFIX = "CLAIMED:";

const dataPath = path.join(__dirname, "../data/tickets.json");

// Ensure file exists
function loadData() {
    if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "{}");
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("claim")
        .setDescription("Claim this ticket"),

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

        // Already claimed check
        if (data[channel.id]) {
            return interaction.reply({
                content: `❌ This ticket is already claimed by <@${data[channel.id].claimedBy}>.`,
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            const originalName = channel.name;

            // Save to JSON
            data[channel.id] = {
                originalName,
                claimedBy: interaction.user.id
            };

            saveData(data);

            // Rename channel
            const newName = `claimed-${interaction.user.username.toLowerCase()}`;
            await channel.setName(newName);

            await interaction.reply({
                content: `${interaction.user} has claimed this ticket.`
            });

        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "❌ Failed to claim ticket.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};