import { DescribeInstancesRequest } from "aws-sdk/clients/ec2"
import aws from 'aws-sdk'
import get from "lodash/get"

const ec2 = new aws.EC2({ region: 'eu-west-1' })

export const getEc2IpAddress = async (instanceId: string) => {
    const params: DescribeInstancesRequest = {
        InstanceIds: [instanceId]
    }

    const result = await ec2.describeInstances(params).promise()
    const ipAddress: string | null = get(result, 'Reservations[0].Instances[0].PublicIpAddress', null)

    if (!ipAddress) throw new Error(`Unable to get IP Address of EC2: ${instanceId}`)

    return ipAddress
}