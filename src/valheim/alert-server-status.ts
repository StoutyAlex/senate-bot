import webhook from 'webhook-discord'
import { getEc2IpAddress } from './helpers/get-ec2-ip'

interface EC2StatusEvent {
    detail: {
        'instance-id': string
        state: 'stopped' | 'pending' | 'running' | 'stopping'
    }
}

const webhookUrl = process.env.DISCORD_HOOK!
const instanceId = process.env.INSTANCE_ID!

export const handler = async (event: EC2StatusEvent) => {
    const { state } = event.detail
    const hook = new webhook.Webhook(webhookUrl)
    
    const name = 'Senate Valheim Status'
    const restartCommand = '`sheev valheim start`'

    if (state === 'running') {
        const ipAddress = await getEc2IpAddress(instanceId)

        const message = new webhook.MessageBuilder()
            .setName(name)
            .setColor('#33EE33')
            .setText('Server is up and running!')
            .addField('Password', 'Sigma')
            .setTitle(`${ipAddress}`)
            .setFooter('Reminder: the IP Changes everytime the server restarts', 'https://emoji.gg/assets/emoji/3224_info.png')
            .setDescription('Could take 2 Minutes to appear online in-game')

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