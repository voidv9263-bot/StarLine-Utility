const { Events } = require('discord.js');

const GUILD_ID = '1515508593460379771';
const WELCOME_CHANNEL_ID = '1515508593988731003';
const WELCOME_ROLE_ID = '1515511930947895347';
const DASHBOARD_LINK = 'https://discord.com/channels/1515508593460379771/1515512340886323201';

module.exports = {
    name: Events.GuildMemberAdd,

    async execute(member) {
        console.log('GuildMemberAdd triggered');
        console.log('Member:', member.user.tag);

        // ONLY run for this guild
        if (member.guild.id !== GUILD_ID) return;

        try {
            const guild = member.guild;

            // Fetch welcome channel
            const welcomeChannel =
                guild.channels.cache.get(WELCOME_CHANNEL_ID) ||
                await guild.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null);

            if (!welcomeChannel) {
                console.error(`Welcome channel not found: ${WELCOME_CHANNEL_ID}`);
                return;
            }

            // Fetch role
            const role = await guild.roles.fetch(WELCOME_ROLE_ID).catch(() => null);

            // Give role
            if (role) {
                await member.roles.add(role);
                console.log(`Assigned role: ${role.name}`);
            } else {
                console.error(`Role not found: ${WELCOME_ROLE_ID}`);
            }

            const memberCount = guild.memberCount;

            // Send welcome message
            await welcomeChannel.send({
                content: `Welcome to **${guild.name}**, <@${member.id}>.`,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 2,
                                label: `${memberCount}`,
                                emoji: {
                                    id: '1517888765274882240',
                                    name: 'starline'
                                },
                                custom_id: 'member_count',
                                disabled: true
                            },
                            {
                                type: 2,
                                style: 5,
                                label: 'Rules',
                                url: DASHBOARD_LINK
                            }
                        ]
                    }
                ]
            });

            console.log('Welcome message sent successfully');

        } catch (error) {
            console.error('Welcome Message Error:', error);
        }
    }
};
