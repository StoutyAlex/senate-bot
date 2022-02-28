import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as events from '@aws-cdk/aws-events'
import * as targets from '@aws-cdk/aws-events-targets'
import { SenateECSContainer } from './discord-bot-ecs';
import * as dynamo from '@aws-cdk/aws-dynamodb'
import { CfnOutput, RemovalPolicy } from '@aws-cdk/core';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import path from 'path';

export type Stage = 'prod'

export interface SenateBotProps extends cdk.StackProps {
    stage: Stage
    mcStartStopName: string
    valheimStartStopName: string
    botToken: string
    executeRconLambdaName: string
}

export class SenateBot extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: SenateBotProps) {
        super(scope, id, props)

        const constructName = (name: string) => `senate-bot-${name}_${props.stage}`
        const stackName = (name: string) => `senate-bot_${name}`
        
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

        const senateBilling = new NodejsFunction(this, stackName('senate-billing'), {
            functionName: constructName('billing'),
            entry: path.join(__dirname, '../src/lambdas/monthly-report.ts'),
            timeout: cdk.Duration.seconds(10),
            bundling: {
                externalModules: ['aws-sdk'],
                forceDockerBundling: false
            }
        })

        senateBilling.role?.attachInlinePolicy(new iam.Policy(this, stackName('cost-and-usage'), {
            statements: [
                new iam.PolicyStatement({
                    actions: ['ce:GetCostAndUsage', 'ssm:GetParameter'],
                    resources: ['*']
                })
            ]
        }))

        const monthlySchedule = new events.Rule(this, 'monthly-schedule', {
            schedule: events.Schedule.cron({ hour: '14', day: '28', minute: '0' }),
            ruleName: constructName('monthly-schedule'),
        })

        monthlySchedule.addTarget(new targets.LambdaFunction(senateBilling))

        const discordBot = new SenateECSContainer(this, stackName('ecs-construct'), {
            constructName,
            stackName,
            botToken: props.botToken,
            stage: props.stage,
            environment: {
                MEMBER_TABLE_NAME: memberTable.tableName,
                START_STOP_MC_LAMBDA_NAME: props.mcStartStopName,
                START_STOP_VALHEIM_LAMBDA_NAME: props.valheimStartStopName,
                EXECUTE_RCON_LAMBDA_NAME: props.executeRconLambdaName
            }
        })
        
        discordBot.role.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess')
        )

        memberTable.grantFullAccess(discordBot.role)

        new CfnOutput(this, 'MemberTableName', {
            value: memberTable.tableName
        })

        new CfnOutput(this, 'BillingLambdaName', {
            value: senateBilling.functionName
        })
    }
}
