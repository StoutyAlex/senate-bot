import AWS, { Lambda } from 'aws-sdk'

const ec2 = new AWS.EC2()
const lambda = new AWS.Lambda()

const instanceId = process.env.MINECRAFT_INSTANCE_ID!
const stopLambdaName = process.env.STOP_LAMBDA_NAME!

export interface SchedulerInput {
    action: 'start' | 'stop'
}

export const handler = async (event: SchedulerInput) => {
    if (event.action === 'start') {
        await ec2.startInstances({
            InstanceIds: [instanceId]
        }).promise()
        return;
    }

    const params: Lambda.Types.InvocationRequest = {
        FunctionName: stopLambdaName,
        InvocationType: 'Event'
    }

    await lambda.invoke(params).promise()
}
