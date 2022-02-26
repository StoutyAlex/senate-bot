
import { CommandMeta } from "../../types"
import { Guild, Message, MessageActionRow, MessageButton, MessageEmbed, MessageOptions, TextChannel } from 'discord.js'
import { BaseCommand } from "../../structures/command"
import { userHasRole } from "../../helpers/roles"
import { SenateRoles } from "../../constants/roles"
import { GameServer, GAME_SERVERS, STATE_COLORS } from "../../constants/game-servers"
import { getMessageByPurpose, MessageRecord, saveMessage } from "../../database/message-table"
import { ButtonActions, getGameServerButtonId } from "../../helpers/buttons"
import { invokeLambda } from "../../helpers/lambda"
import { GameServerStatusUpdate } from "../../structures/api"

export class GameServerCommand extends BaseCommand {
    public meta: CommandMeta = {
        name: 'game-server',
        aliases: ['gs']
    }

    public async execute(message: Message, args: string[]) {
        await this.initRoles(message.guild!)

        const isUserAllowed = userHasRole(message.member!, SenateRoles.GAME_SERVER_BASIC)
        if (!isUserAllowed) return message.channel.send('You are not permitted to use this command')
        if (args.length < 2) return message.channel.send('Invalid command')

        const [ subcommand, ...rest ] = args

        if (subcommand === 'setup') {
            return await this.setup(message, rest)
        }

        return message.channel.send('Unrecognised command command')
    }

    private static createMessagePayload (update: GameServerStatusUpdate): MessageOptions {
        const gameServer = GAME_SERVERS.find(gs => gs.id === update.gameServerId)!

        const readableState = update.state.charAt(0).toUpperCase() + update.state.slice(1)
        const embed = new MessageEmbed().setTitle(`${gameServer.title} - ${readableState}`).setColor(STATE_COLORS[update.state])

        if (update.state === 'pending') {
            embed.setDescription('Could take 2 Minutes to appear online in-game')
        }

        if (update.state === 'running') {
            embed.addField('IP Address', update.ipAddress!)
            if (gameServer.version) embed.addField('Version', gameServer.version)
            embed.setFooter('Reminder: the IP Changes everytime the server restarts', 'https://emoji.gg/assets/emoji/3224_info.png')
        }

        if (update.state === 'stopping') {
            embed.setDescription(`server is stopping please do not attempt anything till stopped`)
            if (update.reason) embed.addField('Shutdown reason', update.reason)
        }

        if (update.state === 'stopped') {
            embed.setDescription('Server has shutdown, restart the server using the buttons below.')
            if (update.reason) embed.addField('Shutdown reason', update.reason)
        }

        const base = { embeds: [embed], components: [
            new MessageActionRow({
                components: [
                    new MessageButton({
                        customId: getGameServerButtonId(ButtonActions.start, gameServer.id),
                        style: 'SUCCESS',
                        disabled: update.state !== 'stopped',
                        label: 'Start Server'
                    }),
                    new MessageButton({
                        customId: getGameServerButtonId(ButtonActions.stop, gameServer.id),
                        style: 'DANGER',
                        disabled: update.state !== 'running',
                        label: 'Stop Server'
                    })
                ]
            })
        ]}

        return base
    }

    private async setup (message: Message, args: string[]) {
        const [ gameServerInput ] = args

        const gameServer = GAME_SERVERS.find(gs => gs.alias.toLowerCase() === gameServerInput.toLowerCase())
        if (!gameServer) return message.channel.send(`Invalid game server. Valid servers are as follows:\n${GAME_SERVERS.map(gs => gs.alias).join()}`)

        const payload = GameServerCommand.createMessagePayload({
            gameServerId: gameServer.id,
            state: 'stopped'
        })

        const gameServerMessage = await message.channel.send(payload)

        await saveMessage({
            messageId: gameServerMessage.id,
            channelId: gameServerMessage.channel.id,
            purpose: gameServer.purpose,
            guildId: message.guild!.id
        })

        return
    }

    public static async updateMessage (guild: Guild, messageRecord: MessageRecord, update: GameServerStatusUpdate) {
        const channel = guild.channels.cache.find(channel => channel.id === messageRecord.channelId && channel.type === 'GUILD_TEXT') as TextChannel | undefined
        const messages = await channel?.messages.fetch()
        const message = messages!.find(msg => msg.id === messageRecord.messageId)

        const payload = GameServerCommand.createMessagePayload(update)

        await message?.edit(payload)
    }

    public static async startServer (gameServer: GameServer) {
        await invokeLambda(gameServer.startStopLambda, { action: 'start' })
    }

    public static async stopServer (gameServer: GameServer) {
        await invokeLambda(gameServer.startStopLambda, { action: 'stop' })
    }

    private async initRoles (guild: Guild) {
        await guild.roles.create({
            name: SenateRoles.GAME_SERVER_BASIC,
            color: 'GREEN',
            reason: 'Basic control over game servers',
            hoist: false,
            mentionable: false
        })

        await guild.roles.create({
            name: SenateRoles.GAME_SERVER_OP,
            color: 'BLUE',
            reason: 'Advanced control over game servers',
            hoist: false,
            mentionable: false
        })

        await guild.roles.create({
            name: SenateRoles.GAME_SERVER_ADMIN,
            color: 'RED',
            reason: 'Admin control over game servers',
            hoist: false,
            mentionable: false
        })
    }
}
