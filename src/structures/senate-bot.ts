import { Client, Guild, Intents, TextChannel } from "discord.js"
import { GAME_SERVERS } from "../constants/game-servers"
import { MESSAGE_PURPOSE } from "../constants/message-purposes"
import { getMessageByPurpose, saveMessage } from "../database/message-table"
import { getGeneralChannel, getTextChannelById, getTextChannelByName } from "../helpers/channel"
import { GameServerCommand } from "../lib/commands/game-server"
import { BotConfig } from "../lib/configuration/config-helper"
import { Events } from "../types"
import { GameServerStatusUpdate } from "./api"
import { BaseCommand } from "./command"

export interface SenateBotProps {
    config: BotConfig
    commands: typeof BaseCommand[]
    events: Events
}

const senateGuildId = process.env.SENATE_GUILD_ID!

export class SenateBot extends Client { 
    public readonly config: BotConfig
    public commands: BaseCommand[]
    private readonly events: Events
    public mainChannel: TextChannel
    public senateGuild: Guild

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

    async handleGameServerStatusUpdate(update: GameServerStatusUpdate) {
        const gameServer = GAME_SERVERS.find(gs => gs.id === update.gameServerId)
        const message = await getMessageByPurpose(gameServer!.purpose)

        if (!message) return getGeneralChannel(this.senateGuild).send('Unable to handle game server update')

        return GameServerCommand.updateMessage(this.senateGuild, message, update)
    }

    async start(token: string) {
        this.on('ready', async () => {
            console.log('Bot is ready')
            // This needs to be better
            this.mainChannel = getGeneralChannel(this.senateGuild)
        })

        Object.entries(this.events).forEach(([name, handler]) => {
            const eventHandler = new handler(this)
            this.on(name, (...args) => eventHandler.execute(args))
            console.log('Added event', { eventName: name })
        })

        await this.login(token)

        const senateGuild = await this.guilds.fetch(senateGuildId)
        if (!senateGuild) {
            throw new Error('Unable to find senate guild')
        }

        this.senateGuild = senateGuild

        return this;
    }
}
