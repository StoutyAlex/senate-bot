import webhook from 'webhook-discord'
import { getDiscordBotIpAddress } from './helpers/get-bot-ip'
import { getEc2Details } from './helpers/get-ec2-ip'
import axios from 'axios'
import { GameServerStatusUpdate } from '../structures/api'
import { GAME_SERVERS } from '../constants/game-servers'

export interface EC2StatusEvent {
    detail: {
        'instance-id': string
        state: 'stopped' | 'pending' | 'running' | 'stopping'
    }
}

const webhookUrl = process.env.MC_STATUS_DISCORD_HOOK!
const instanceId = process.env.MINECRAFT_INSTANCE_ID!
const mcPort = process.env.MC_PORT!
const ftb = process.env.FTB!

export const handler = async (event: EC2StatusEvent) => {
    const { state } = event.detail
    const hook = new webhook.Webhook(webhookUrl)
    
    const isFtb = ftb === 'true'

    const name = isFtb ? 'Senate FTB Status' : 'Senate MC Status'
    const restartCommand = isFtb ? '`sheev ftb start`' : '`sheev minecraft start`'

    const discordBotIPAddress = await getDiscordBotIpAddress()
    const gameServerUrl = `http://${discordBotIPAddress}:3000/game-server`

    const details = await getEc2Details(instanceId)
    const serverInstance = GAME_SERVERS.find(gs => gs.instanceName === details.name)

    const updateRequest: GameServerStatusUpdate = {
        state,
        ipAddress: details.ipAddress || undefined,
        gameServerId: serverInstance!.id
    }

    await axios.post(gameServerUrl, updateRequest)

    if (state === 'running') {

        const message = new webhook.MessageBuilder()
            .setName(name)
            .setColor('#33EE33')
            .setText('Server is up and running!')
            .setTitle(`${details.ipAddress}:${mcPort}`)
            .addField('Version', isFtb ? 'FTB Ultimate: Anniversary Edition. v1.2.0' : '1.18.1')
            .setFooter('Reminder: the IP Changes everytime the server restarts', 'https://emoji.gg/assets/emoji/3224_info.png')
            .setDescription('Could take 2 Minutes to appear online in-game')

        if (!isFtb) 
            message.addField('World Map', `http://${details.ipAddress}:8123`)

        await hook.send(message)
    }

    if (state === 'pending') {
        const message = new webhook.MessageBuilder()
            .setName(name)
            .setColor('#EEEE33')
            .setText('Server is starting up, give it a few mins!')
            .setTitle('Status: Pending')
            .setDescription('Could take 5 Minutes to appear online in-game')

        await hook.send(message)
    }

    if (state === 'stopping') {
        const message = new webhook.MessageBuilder()
            .setName(name)
            .setColor('#FF4500')
            .setText('Server is stopping!')
            .setTitle('Server is being shutdown')
            .setDescription(`start the server again with the ${restartCommand} command`)

        await hook.send(message)
    }

    if (state === 'stopped') {
        const message = new webhook.MessageBuilder()
            .setName(name)
            .setColor('#FF3333')
            .setText('Server has stopped!')
            .setTitle('Server is offline')
            .setDescription(`start the server again with the ${restartCommand} command`)

        await hook.send(message)
    }
}