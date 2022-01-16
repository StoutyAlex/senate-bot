import aws from 'aws-sdk'
import { InvocationType } from 'aws-sdk/clients/lambda'

const lambda = new aws.Lambda({ region: 'eu-west-1' })

export const invokeLambda = (name: string, payload?: unknown, InvocationType: InvocationType = 'Event') => {
    return lambda.invoke({
        FunctionName: name,
        InvocationType,
        Payload: payload ? JSON.stringify(payload) : undefined
    }).promise()
}
