const {
    Events,
    EmbedBuilder
} = require("discord.js");

const WATCH_BOT_ID = "1517577280434475141"; // Bot you want to monitor
const STATUS_CHANNEL_ID = "1517908894612197436"; // Channel to send/edit the embed
const STATUS_MESSAGE_ID = "123456789012345678"; // Existing message ID to edit

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

            const message = await channel.messages.fetch(STATUS_MESSAGE_ID).catch(() => null);
            if (!message) return;

            const status = member.presence?.status;

            const online = ["online", "idle", "dnd"].includes(status);

            const embed = new EmbedBuilder()
                .setTitle("StarLine Bot Status")
                .setDescription(
                    `**Status:** ${online ? "🟢 Online" : "🔴 Offline"}`
                )
                .addFields({
                    name: "Current Status",
                    value: status ? status.toUpperCase() : "OFFLINE"
                })
                .setColor(online ? "Green" : "Red")
                .setTimestamp();

            await message.edit({
                embeds: [embed]
            });
        }

        await updateStatus();

        setInterval(updateStatus, 30000);

        client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {

            if (newPresence.userId !== WATCH_BOT_ID) return;

            await updateStatus();

        });

    }
};
