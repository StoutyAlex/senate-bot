import * as cdk from '@aws-cdk/core'
import * as secretManager from "@aws-cdk/aws-secretsmanager";
import { SenateECSContainer } from './discord-bot-ecs';
import * as dynamo from '@aws-cdk/aws-dynamodb'
import { CfnOutput, RemovalPolicy } from '@aws-cdk/core';

export type Stage = 'dev' | 'prod'

export interface SenateBotProps extends cdk.StackProps {
    stage: Stage,
    botTokenArn: string
}

export class SenateBot extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: SenateBotProps) {
        super(scope, id, props)

        const constructName = (name: string) => `senate-bot-${name}_${props.stage}`
        const stackName = (name: string) => `senate-bot_${name}`
        
        const secretBotToken = secretManager.Secret.fromSecretCompleteArn(this, stackName('bot-token'), props.botTokenArn)

        const messageTable = new dynamo.Table(this, stackName('message-table'), {
            tableName: constructName('message-table'),
            partitionKey: {
                name: 'messageId',
                type: dynamo.AttributeType.STRING
            },
            removalPolicy: RemovalPolicy.RETAIN
        })

        const discordBot = new SenateECSContainer(this, stackName('ecs-construct'), {
            constructName,
            stackName,
            botToken: secretBotToken.secretValue.toString(),
            stage: props.stage,
            environment: {
                MESSAGE_TABLE_NAME: messageTable.tableName
            }
        })
        
        messageTable.grantFullAccess(discordBot.role)

        new CfnOutput(this, 'MessageTableName', {
            value: messageTable.tableName
        })
    }
}
