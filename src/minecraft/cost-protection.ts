import AWS, { Lambda } from 'aws-sdk'
import { DescribeInstancesRequest } from 'aws-sdk/clients/ec2'
import * as util from 'minecraft-server-util'
import get from 'lodash/get'

const ec2 = new AWS.EC2()
const lambda = new AWS.Lambda()

const stopLambdaName = process.env.STOP_LAMBDA_NAME!
const instanceId = process.env.MINECRAFT_INSTANCE_ID!
const mcPort = process.env.MC_PORT!


export interface SchedulerInput {
    action: 'start' | 'stop'
}

export const handler = async (event: SchedulerInput) => {
    const params: DescribeInstancesRequest = {
        InstanceIds: [instanceId]
    }

    const result = await ec2.describeInstances(params).promise()
    const ipAddress: string | null = get(result, 'Reservations[0].Instances[0].PublicIpAddress', null)

    if (!ipAddress) throw new Error(`Unable to get IP Address of EC2: ${instanceId}`)

    const status = await util.status(ipAddress, Number(mcPort))

    if (status.players.online === 0) {
        console.log('Zero players are online, stopping server')

        const params: Lambda.Types.InvocationRequest = {
            FunctionName: stopLambdaName,
            InvocationType: 'Event'
        }
    
        await lambda.invoke(params).promise()
    }
}
