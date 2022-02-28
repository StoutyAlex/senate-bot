import AWS from 'aws-sdk'

const ec2 = new AWS.EC2()
const instanceId = process.env.INSTANCE_ID!

export const handler = async () => {
    await ec2.stopInstances({
        InstanceIds: [instanceId]
    }).promise()
}
