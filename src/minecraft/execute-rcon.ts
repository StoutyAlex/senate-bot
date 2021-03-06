

import * as util from 'minecraft-server-util'
import { getEc2IpAddress } from './helpers/get-ec2-ip'
import { getRconPassword } from './helpers/get-rcon-password'

const instanceId = process.env.MINECRAFT_INSTANCE_ID!
const rconPort = process.env.RCON_PORT!

const client = new util.RCON()

export interface ExecuteRconParams {
    command: string
}

export interface ExecuteRconResponse {
    command: string
    response: string
}

export const handler = async ({ command }: ExecuteRconParams) => {
    const ipAddress = await getEc2IpAddress(instanceId)
    const rconPassword = await getRconPassword()

    await client.connect(ipAddress, Number(rconPort))
    await client.login(rconPassword)

    const response = await client.execute(command)

    return {
        command, 
        response
    } as ExecuteRconResponse
}
