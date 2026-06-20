require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ======================
// ENV VARIABLES
// ======================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ======================
// SAFETY CHECK
// ======================

if (!TOKEN) {
    console.error("Missing TOKEN in .env");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("Missing CLIENT_ID in .env");
    process.exit(1);
}

// ======================
// CLIENT
// ======================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

// ======================
// COLLECTIONS
// ======================

client.commands = new Collection();
client.buttons = new Collection();

// ======================
// COMMAND LOADER
// ======================

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath);
}

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

const commandsArray = [];

for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);

        if (command?.data?.name) {
            client.commands.set(command.data.name, command);
            commandsArray.push(command.data.toJSON());

            console.log(`[COMMAND LOADED] ${file}`);
        }
    } catch (err) {
        console.log(`[COMMAND ERROR] ${file}`);
        console.error(err);
    }
}

// ======================
// BUTTON LOADER
// ======================

const buttonsPath = path.join(__dirname, "buttons");

if (!fs.existsSync(buttonsPath)) {
    fs.mkdirSync(buttonsPath);
}

const buttonFiles = fs
    .readdirSync(buttonsPath)
    .filter(file => file.endsWith(".js"));

for (const file of buttonFiles) {
    try {
        const button = require(`./buttons/${file}`);

        if (button?.customId && button?.execute) {
            client.buttons.set(button.customId, button);

            console.log(`[BUTTON LOADED] ${button.customId}`);
        }
    } catch (err) {
        console.log(`[BUTTON ERROR] ${file}`);
        console.error(err);
    }
}

// ======================
// EVENT LOADER
// ======================

const eventsPath = path.join(__dirname, "events");

if (!fs.existsSync(eventsPath)) {
    fs.mkdirSync(eventsPath);
}

const eventFiles = fs
    .readdirSync(eventsPath)
    .filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    try {
        const eventFile = require(`./events/${file}`);

        // Single event export
        if (eventFile.name && eventFile.execute) {

            if (eventFile.once) {
                client.once(eventFile.name, (...args) =>
                    eventFile.execute(...args, client)
                );
            } else {
                client.on(eventFile.name, (...args) =>
                    eventFile.execute(...args, client)
                );
            }

            console.log(`[EVENT LOADED] ${file}`);
            continue;
        }

        // Multiple exports in one file
        let loaded = false;

        for (const key of Object.keys(eventFile)) {

            const event = eventFile[key];

            if (!event?.name || !event?.execute) continue;

            if (event.once) {
                client.once(event.name, (...args) =>
                    event.execute(...args, client)
                );
            } else {
                client.on(event.name, (...args) =>
                    event.execute(...args, client)
                );
            }

            console.log(`[EVENT LOADED] ${file} (${event.name})`);
            loaded = true;
        }

        if (!loaded) {
            console.log(`[EVENT ERROR] Invalid structure: ${file}`);
        }

    } catch (err) {
        console.log(`[EVENT CRASH] ${file}`);
        console.error(err);
    }
}

// ======================
// READY EVENT
// ======================

client.once("ready", async () => {

    console.log(`Logged in as ${client.user.tag}`);
    console.log("[BOT] Ready and online");

    try {

        const rest = new REST({
            version: "10"
        }).setToken(TOKEN);

        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            {
                body: commandsArray
            }
        );

        console.log(`[BOT] ${commandsArray.length} commands deployed globally.`);

    } catch (err) {

        console.log("[BOT ERROR] Command deploy failed");
        console.error(err);

    }

});

// ======================
// ERROR HANDLING
// ======================

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// ======================
// LOGIN
// ======================

client.login(TOKEN);
