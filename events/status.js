const {
    Events,
    EmbedBuilder
} = require("discord.js");

const WATCH_BOT_ID = "1517577280434475141";
const STATUS_CHANNEL_ID = "1517908894612197436";
const STATUS_MESSAGE_ID = null; // Put the message ID here after first startup

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {

        async function updateStatus() {

            const guild = client.guilds.cache.first();
            if (!guild) return;

            const member = await guild.members.fetch(WATCH_BOT_ID).catch(() => null);
            if (!member) return;

            const channel = await client.channels.fetch(STATUS_CHANNEL_ID).catch(() => null);
            if (!channel) return;

            const status = member.presence?.status;

            const online = ["online", "idle", "dnd"].includes(status);

            const embed = new EmbedBuilder()
                .setTitle("StarLine Bot Status")
                .setDescription(
                    `**Status:** ${online ? "🟢 Online" : "🔴 Offline"}`
                )
                .addFields({
                    name: "Current Status",
                    value: status ? status.toUpperCase() : "OFFLINE",
                    inline: true
                })
                .setColor(online ? "Green" : "Red")
                .setTimestamp();

            // First run - create message
            if (!STATUS_MESSAGE_ID) {

                const msg = await channel.send({
                    embeds: [embed]
                });

                console.log("=================================");
                console.log("STATUS EMBED CREATED");
                console.log("MESSAGE ID:", msg.id);
                console.log("Copy this ID into STATUS_MESSAGE_ID");
                console.log("=================================");

                return;
            }

            // Edit existing message
            const message = await channel.messages
                .fetch(STATUS_MESSAGE_ID)
                .catch(() => null);

            if (!message) return;

            await message.edit({
                embeds: [embed]
            });

        }

        // Update immediately
        await updateStatus();

        // Update every 30 seconds
        setInterval(updateStatus, 30000);

        // Update whenever the watched bot's presence changes
        client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {

            if (newPresence.userId !== WATCH_BOT_ID) return;

            await updateStatus();

        });

    }
};
