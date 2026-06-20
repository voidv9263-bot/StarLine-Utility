const { Events, ActivityType } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);

        // Set bot status to Do Not Disturb
        client.user.setStatus("dnd");

        // Set activity
        client.user.setActivity("over StarLine", {
            type: ActivityType.Watching
        });
    }
};
