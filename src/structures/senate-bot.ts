import { Client, Intents } from "discord.js";
import { BotConfig } from "../lib/configuration/config-helper";
import { Events } from "../types";
import { BaseCommand } from "./command";

export interface SenateBotProps {
    config: BotConfig
    commands: typeof BaseCommand[]
    events: Events
}

export class SenateBot extends Client { 
    public readonly config: BotConfig
    public commands: BaseCommand[]
    private readonly events: Events

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

    async start(token: string) {
        this.on('ready', () => {
            console.log('Bot is ready')
        })

        Object.entries(this.events).forEach(([name, handler]) => {
            const eventHandler = new handler(this)
            this.on(name, (...args) => eventHandler.execute(args))
            console.log('Added event', { eventName: name })
        })

        this.on('message', (message) => {
            if (message.content.startsWith(this.config.prefix + ' ')) {
                
            }
        })

        await this.login(token)
        return this;
    }
}
