const { Events, MessageFlags } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {

        // ======================
        // SLASH COMMANDS
        // ======================
        if (interaction.isChatInputCommand()) {

            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {

                await command.execute(interaction, client);

            } catch (err) {

                console.error("Command error:", err);

                try {

                    if (interaction.replied) {

                        await interaction.editReply({
                            content: "❌ Error running command."
                        });

                    } else if (interaction.deferred) {

                        await interaction.editReply({
                            content: "❌ Error running command."
                        });

                    } else {

                        await interaction.reply({
                            content: "❌ Error running command.",
                            flags: MessageFlags.Ephemeral
                        });
                    }

                } catch {}
            }

            return;
        }

        // ======================
        // BUTTONS
        // ======================
        if (interaction.isButton()) {

            let button = client.buttons.get(interaction.customId);

            // Support RegExp customIds
            if (!button) {

                button = [...client.buttons.values()].find(btn =>
                    btn.customId instanceof RegExp &&
                    btn.customId.test(interaction.customId)
                );
            }

            if (!button) {

                console.log(
                    `[BUTTON NOT FOUND] ${interaction.customId}`
                );

                try {

                    if (!interaction.replied && !interaction.deferred) {

                        await interaction.reply({
                            content: "❌ This button is not configured.",
                            flags: MessageFlags.Ephemeral
                        });
                    }

                } catch {}

                return;
            }

            try {

                await button.execute(interaction, client);

            } catch (err) {

                console.error("Button error:", err);

                try {

                    if (!interaction.replied && !interaction.deferred) {

                        await interaction.reply({
                            content: "❌ Button error occurred.",
                            flags: MessageFlags.Ephemeral
                        });

                    } else if (interaction.deferred) {

                        await interaction.editReply({
                            content: "❌ Button error occurred."
                        });
                    }

                } catch {}
            }

            return;
        }

        // ======================
        // SELECT MENUS
        // ======================
        if (interaction.isStringSelectMenu()) {

            let menu = client.selectMenus?.get(interaction.customId);

            if (!menu) return;

            try {

                await menu.execute(interaction, client);

            } catch (err) {

                console.error("Select menu error:", err);

                try {

                    if (!interaction.replied && !interaction.deferred) {

                        await interaction.reply({
                            content: "❌ Menu error occurred.",
                            flags: MessageFlags.Ephemeral
                        });

                    } else if (interaction.deferred) {

                        await interaction.editReply({
                            content: "❌ Menu error occurred."
                        });
                    }

                } catch {}
            }

            return;
        }

        // ======================
        // MODALS
        // ======================
        if (interaction.isModalSubmit()) {

            let modal = client.modals?.get(interaction.customId);

            if (!modal) return;

            try {

                await modal.execute(interaction, client);

            } catch (err) {

                console.error("Modal error:", err);

                try {

                    if (!interaction.replied && !interaction.deferred) {

                        await interaction.reply({
                            content: "❌ Modal error occurred.",
                            flags: MessageFlags.Ephemeral
                        });

                    } else if (interaction.deferred) {

                        await interaction.editReply({
                            content: "❌ Modal error occurred."
                        });
                    }

                } catch {}
            }
        }
    }
};