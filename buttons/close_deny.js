const { MessageFlags } = require("discord.js");

module.exports = {
    customId: "close_deny",

    async execute(interaction) {
        const channel = interaction.channel;
        const ownerId = channel.topic;

        if (!ownerId) {
            return interaction.reply({
                content: "❌ Ticket owner not found.",
                flags: MessageFlags.Ephemeral
            });
        }

        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: `❌ Only <@${ownerId}> can use this.`,
                flags: MessageFlags.Ephemeral
            });
        }

        // =========================
        // REMOVE EMBED + BUTTONS
        // =========================
        return interaction.update({
            flags: MessageFlags.IsComponentsV2,
            components: [
                {
                    type: 17,
                    components: [
                        {
                            type: 10,
                            content: "## Ticket Close Request Denied"
                        },
                        {
                            type: 14,
                            divider: true
                        },
                        {
                            type: 10,
                            content: `**Denied by:** <@${interaction.user.id}>\n**Owner:** <@${ownerId}>\n\nThe ticket will remain open.`
                        }
                    ]
                }
            ]
        });
    }
};