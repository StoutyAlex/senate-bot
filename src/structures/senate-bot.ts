import { Client, Intents, TextChannel } from "discord.js"
import { MESSAGE_PURPOSE } from "../constants/message-purposes"
import { getMessageByPurpose, saveMessage } from "../database/message-table"
import { getGeneralChannel, getTextChannelById, getTextChannelByName } from "../helpers/channel"
import { BotConfig } from "../lib/configuration/config-helper"
import { Events } from "../types"
import { BaseCommand } from "./command"

export interface SenateBotProps {
    config: BotConfig
    commands: typeof BaseCommand[]
    events: Events
}

export class SenateBot extends Client { 
    public readonly config: BotConfig
    public commands: BaseCommand[]
    private readonly events: Events
    public mainChannel: TextChannel

    constructor(props: SenateBotProps) {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_PRESENCES,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_MESSAGE_TYPING,
                Intents.FLAGS.DIRECT_MESSAGES,
            ],
            allowedMentions: {
				parse: ["users"]
			}
        })

        this.config = props.config
        this.events = props.events
        this.commands = props.commands.map(command => new command(this));
    }

    async send(message: string) {
        const general = getGeneralChannel(this)
        general.send(message)
    }

    async start(token: string) {
        this.on('ready', async () => {
            console.log('Bot is ready')
            this.mainChannel = getGeneralChannel(this)
        })

        Object.entries(this.events).forEach(([name, handler]) => {
            const eventHandler = new handler(this)
            this.on(name, (...args) => eventHandler.execute(args))
            console.log('Added event', { eventName: name })
        })

        await this.login(token)

        // setup the categories and channels that are defined in the constants if they aren't already

        return this;
    }
}
