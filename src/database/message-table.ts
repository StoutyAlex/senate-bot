import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const tableName = process.env.MESSAGE_TABLE_NAME!

export interface MessageRecord {
    messageId: string
    channelId: string
    purpose: string
    senderId: string
}

export const saveMessage = async (record: MessageRecord) => {
    await dynamoClient.send(new PutCommand({
        TableName: tableName,
        Item: record
    }))
}

export const getMessageById = async (messageId: string) => {
    const result = await dynamoClient.send(new GetCommand({
        TableName: tableName,
        Key: { messageId }
    }))

    return result.Item as MessageRecord | null
}

export const getMessageByPurpose = async (purpose: string) => {
    const result = await dynamoClient.send(new QueryCommand({
        TableName: tableName,
        IndexName: 'purpose',
        KeyConditionExpression: 'purpose = :purpose',
        ExpressionAttributeValues: {
            ':purpose': purpose
        },
        Limit: 1
    }))

    if (!result.Items || !result.Items.length) return null

    return result.Items[0] as MessageRecord
}
