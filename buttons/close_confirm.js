const { MessageFlags } = require("discord.js");
const { closeTicket } = require("../utils/closeTicket");

module.exports = {
    customId: "close_confirm",

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
        // EDIT MESSAGE (REMOVE UI)
        // =========================
        await interaction.update({
            flags: MessageFlags.IsComponentsV2,
            components: [
                {
                    type: 17,
                    components: [
                        {
                            type: 10,
                            content: "## Ticket Closing Approved"
                        },
                        {
                            type: 14,
                            divider: true
                        },
                        {
                            type: 10,
                            content: `**Closed by:** <@${interaction.user.id}>\n**Owner:** <@${ownerId}>\n\n Ticket is now closing...`
                        }
                    ]
                }
            ]
        });

        // =========================
        // CLOSE TICKET
        // =========================
        await closeTicket(interaction);
    }
};