import { DescribeInstancesRequest } from "aws-sdk/clients/ec2"
import aws from 'aws-sdk'
import get from "lodash/get"

const ec2 = new aws.EC2({ region: 'eu-west-1' })

export const getEc2Details = async (instanceId: string) => {
    const params: DescribeInstancesRequest = {
        InstanceIds: [instanceId]
    }

    const result = await ec2.describeInstances(params).promise()
    const ipAddress: string | null = get(result, 'Reservations[0].Instances[0].PublicIpAddress', null)
    const tags = result.Reservations![0].Instances![0].Tags!

    const name = tags.find(tag => tag.Key?.toLowerCase() === 'name')
    if (!name) throw new Error(`Unable to get IP Address of EC2 ${{ ipAddress, name }}`)

    return { ipAddress, name: name.Value }
}