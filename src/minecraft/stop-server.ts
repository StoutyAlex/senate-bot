import AWS from 'aws-sdk'
import * as util from 'minecraft-server-util'
import { getEc2Details } from './helpers/get-ec2-ip'
import { getRconPassword } from './helpers/get-rcon-password'

const ec2 = new AWS.EC2()
const instanceId = process.env.MINECRAFT_INSTANCE_ID!
const rconPort = process.env.RCON_PORT!

const client = new util.RCON()

const wait = (time: number) => new Promise(resolve => {
    setTimeout(resolve, time)
})

export const handler = async () => {
    const detail = await getEc2Details(instanceId)
    const rconPassword = await getRconPassword()

    client.on('message', async (message) => {
        console.log('Message', message.message)
    })

    await client.connect(detail.ipAddress!, Number(rconPort))
    await client.login(rconPassword)
    await client.run('say Stopping server in 10 seconds...')
    await client.run('save-all')

    await wait(10000)

    await client.run('stop')
    await client.close()

    await ec2.stopInstances({
        InstanceIds: [instanceId]
    }).promise()
}
