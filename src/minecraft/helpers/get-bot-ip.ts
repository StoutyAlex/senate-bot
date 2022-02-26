
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
    if (!ipAddress) throw new Error(`Unable to get IP Address of EC2`)

    return ipAddress
}