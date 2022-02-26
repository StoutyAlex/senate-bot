import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as secretManager from "@aws-cdk/aws-secretsmanager";
import { SenateECSContainer } from './discord-bot-ecs';
import * as dynamo from '@aws-cdk/aws-dynamodb'
import { CfnOutput, RemovalPolicy, Tags } from '@aws-cdk/core';

export type Stage = 'dev' | 'prod'

export interface SenateBotProps extends cdk.StackProps {
    stage: Stage
    mcStartStopName: string
    ftbStartStopName: string
    wallsStartStopName: string
    valheimStartStopName: string
    botTokenArn: string
    senateGuild: string
    executeRconLambdaName: string
    apiPort: number
}

export class SenateBot extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: SenateBotProps) {
        super(scope, id, props)

        const constructName = (name: string) => `senate-bot-${name}_${props.stage}`
        const stackName = (name: string) => `senate-bot_${name}`
        
        const secretBotToken = secretManager.Secret.fromSecretCompleteArn(this, stackName('bot-token'), props.botTokenArn)

        const memberTable = new dynamo.Table(this, stackName('member-table'), {
            tableName: constructName('member-table'),
            partitionKey: {
                name: 'memberId',
                type: dynamo.AttributeType.STRING
            },
            sortKey: {
                name: 'guildId',
                type: dynamo.AttributeType.STRING,
            },
            removalPolicy: RemovalPolicy.RETAIN
        })

        memberTable.addGlobalSecondaryIndex({
            indexName: 'guildIdIndex',
            partitionKey: {
                name: 'guildId',
                type: dynamo.AttributeType.STRING
            }
        })

        const messageTable = new dynamo.Table(this, stackName('message-table'), {
            tableName: constructName('message-table'),
            partitionKey: {
                name: 'messageId',
                type: dynamo.AttributeType.STRING
            },
            removalPolicy: RemovalPolicy.RETAIN
        })

        messageTable.addGlobalSecondaryIndex({
            indexName: 'purpose',
            partitionKey: {
                name: 'purpose',
                type: dynamo.AttributeType.STRING
            }
        })

        const discordBot = new SenateECSContainer(this, stackName('ecs-construct'), {
            constructName,
            stackName,
            botToken: secretBotToken.secretValue.toString(),
            stage: props.stage,
            environment: {
                MEMBER_TABLE_NAME: memberTable.tableName,
                MESSAGE_TABLE_NAME: messageTable.tableName,
                START_STOP_MC_LAMBDA_NAME: props.mcStartStopName,
                START_STOP_WALLS_LAMBDA_NAME: props.wallsStartStopName,
                START_STOP_FTB_LAMBDA_NAME: props.ftbStartStopName,
                START_STOP_VALHEIM_LAMBDA_NAME: props.valheimStartStopName,
                EXECUTE_RCON_LAMBDA_NAME: props.executeRconLambdaName,
                SENATE_GUILD_ID: props.senateGuild,
                API_PORT: props.apiPort.toString()
            }
        })
        
        discordBot.role.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess')
        )

        memberTable.grantFullAccess(discordBot.role)
        messageTable.grantReadWriteData(discordBot.role)

        new CfnOutput(this, 'MemberTableName', {
            value: memberTable.tableName
        })
    }
}
