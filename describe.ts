
import { DescribeInstancesRequest } from "aws-sdk/clients/ec2"
import aws from 'aws-sdk'
import get from "lodash/get"

const ec2 = new aws.EC2({ region: 'eu-west-1' })

export const getDiscordBotIpAddress = async () => {
    const params: DescribeInstancesRequest = {
        Filters: [{
            Name: `tag:Name`,
            Values: ['senate-bot/senate-bot_ecs-construct/senate-bot_cluster/senate-bot_scaling-group']
        }, {
            Name: 'instance-state-name',
            Values: ['running']
        }]
    }

    const result = await ec2.describeInstances(params).promise()

    const ipAddress: string | null = get(result, 'Reservations[0].Instances[0].PublicIpAddress', null)
    const tags = result.Reservations![0].Instances![0].Tags!

    const name = tags.find(tag => tag.Key?.toLowerCase() === 'name')
    if (!ipAddress || !name) throw new Error(`Unable to get IP Address of EC2 ${{ ipAddress, name }}`)

    return { ipAddress, name: name.Value! }
}
export interface EC2StatusEvent {
    detail: {
        'instance-id': string
        state: 'stopped' | 'pending' | 'running' | 'stopping'
    }
}