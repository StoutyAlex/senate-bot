import webhook from 'webhook-discord'
import { getEc2IpAddress } from './helpers/get-ec2-ip'

interface EC2StatusEvent {
    detail: {
        'instance-id': string
        state: 'stopped' | 'pending' | 'running' | 'stopping'
    }
}

const webhookUrl = process.env.MC_STATUS_DISCORD_HOOK!
const instanceId = process.env.MINECRAFT_INSTANCE_ID!
const mcPort = process.env.MC_PORT!

export const handler = async (event: EC2StatusEvent) => {
    const { state } = event.detail
    const hook = new webhook.Webhook(webhookUrl)

    if (state === 'running') {
        const ipAddress = await getEc2IpAddress(instanceId)

        const message = new webhook.MessageBuilder()
            .setName('Senate MC Status')
            .setColor('#33EE33')
            .setText('Server is up and running!')
            .setTitle(`${ipAddress}:${mcPort}`)
            .setFooter('Reminder: the IP Changes everytime the server restarts', 'https://emoji.gg/assets/emoji/3224_info.png')
            .setDescription('Could take 2 Minutes to appear online in-game')

        await hook.send(message)
    }

    if (state === 'pending') {
        const message = new webhook.MessageBuilder()
            .setName('Senate MC Status')
            .setColor('#EEEE33')
            .setText('Server is starting up, give it a few mins!')
            .setTitle('Status: Pending')
            .setDescription('Could take 5 Minutes to appear online in-game')

        await hook.send(message)
    }

    if (state === 'stopping') {
        const message = new webhook.MessageBuilder()
            .setName('Senate MC Status')
            .setColor('#FF4500')
            .setText('Server is stopping!')
            .setTitle('Server is being shutdown')
            .setDescription('start the server again with the `sheev minecraft start` command')

        await hook.send(message)
    }

    if (state === 'stopped') {
        const message = new webhook.MessageBuilder()
            .setName('Senate MC Status')
            .setColor('#FF3333')
            .setText('Server has stopped!')
            .setTitle('Server is offline')
            .setDescription('start the server again with the `sheev minecraft start` command')

        await hook.send(message)
    }
}