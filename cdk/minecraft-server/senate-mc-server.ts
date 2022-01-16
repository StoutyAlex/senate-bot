import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import * as path from 'path'
import * as events from '@aws-cdk/aws-events'
import * as targets from '@aws-cdk/aws-events-targets'
import * as secretsmanager from '@aws-cdk/aws-secretsmanager'
import * as eventTargets from '@aws-cdk/aws-events-targets'
import { readFileSync } from 'fs';
import { EbsDeviceVolumeType } from '@aws-cdk/aws-ec2';
import { SenateMCSecurityGroup } from './mc-server-security-group';
import { SenateMCBundle } from './mc-server-bundle';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'

export interface SenateMinecraftServerProps extends cdk.StackProps {
    rconPasswordArn: string
    rconPassword: string
    mcStatusDiscordHook: string
}

export class SenateMinecraftServer extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: SenateMinecraftServerProps) {
        super(scope, id, props)

        const buildName = (name: string) => `senate-minecraft-${name}`

        const publicSubnetConfig: ec2.SubnetConfiguration = {
            name: 'PublicSubnet',
            subnetType: ec2.SubnetType.PUBLIC
        }

        const eventBus = events.EventBus.fromEventBusName(this, 'default-bus', 'default')

        const vpc = new ec2.Vpc(this, 'vpc', {
            maxAzs: 2,
            subnetConfiguration: [publicSubnetConfig],
            natGateways: 0
        })

        const serverSecurityGroup = new SenateMCSecurityGroup(this, 'security-group', {
            vpc,
            allowAllOutbound: true,
            rconPort: 25575,
            mcPort: 25565
        })

        const bundle = new SenateMCBundle(this, 'bundle', {
            serverSecurityGroup,
            rconPassword: props.rconPassword,
            buildName,
        })

        const role = new iam.Role(this, 'server-role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
            ]
        })

        bundle.bucket.grantReadWrite(role)

        const ec2Instance = new ec2.Instance(this, 'ec2-instance', {
            vpc,
            role,
            securityGroup: serverSecurityGroup,
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T2,
                ec2.InstanceSize.MEDIUM
            ),
            blockDevices: [
                {
                    deviceName: '/dev/xvda',
                    volume: {
                        ebsDevice: {
                            volumeSize: 8,
                            volumeType: EbsDeviceVolumeType.GP2,
                        }
                    }
                }
            ],
            machineImage: new ec2.AmazonLinuxImage({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
            }),
            keyName: 'minecraft-key',
        })

        eventBus.grantPutEventsTo(ec2Instance)

        const dataScript = readFileSync(path.join(__dirname, 'user-data.sh'), 'utf8')
        ec2Instance.addUserData(dataScript)

        const ec2ManagementRoles = new iam.Role(this, 'ec2-management-roles', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
              iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'),
              iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_FullAccess'),
              iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
            ]
          })

        const baseEnvironments = {
            MINECRAFT_INSTANCE_ID: ec2Instance.instanceId,
            RCON_PASSWORD_ARN: props.rconPasswordArn,
            RCON_PORT: '25575',
            MC_PORT: '25565'
        }

        const rconSecret = secretsmanager.Secret.fromSecretCompleteArn(this, 'rcon-password', props.rconPasswordArn)
        rconSecret.grantRead(ec2ManagementRoles)

        const stopLambda = new NodejsFunction(this, 'stop-lambda', {
            functionName: buildName('stop'),
            entry: path.join(__dirname, '../../src/minecraft/stop-server.ts'),
            role: ec2ManagementRoles,
            environment: {
                ...baseEnvironments
            },
            timeout: cdk.Duration.seconds(15),
            bundling: {
                externalModules: ['aws-sdk'],
                forceDockerBundling: false
            }
        })

        new NodejsFunction(this, 'execute-lambda', {
            functionName: buildName('execute-rcon'),
            entry: path.join(__dirname, '../../src/minecraft/execute-rcon.ts'),
            role: ec2ManagementRoles,
            environment: {
                ...baseEnvironments
            },
            timeout: cdk.Duration.seconds(10),
            bundling: {
                externalModules: ['aws-sdk'],
                forceDockerBundling: false
            }
        })
    
        new NodejsFunction(this, 'stop-start-lambda', {
            functionName: buildName('start-stop'),
            entry: path.join(__dirname, '../../src/minecraft/start-stop-server.ts'),
            role: ec2ManagementRoles,
            environment: {
                ...baseEnvironments,
                STOP_LAMBDA_NAME: stopLambda.functionName
            },
            bundling: {
                externalModules: ['aws-sdk'],
                forceDockerBundling: false
            },
        })

        const alertStatus = new NodejsFunction(this, 'alert-started', {
            functionName: buildName('alert-status'),
            entry: path.join(__dirname, '../../src/minecraft/alert-server-status.ts'),
            role: ec2ManagementRoles,
            environment: {
                ...baseEnvironments,
                MC_STATUS_DISCORD_HOOK: props.mcStatusDiscordHook
            },
            bundling: {
                externalModules: ['aws-sdk'],
                forceDockerBundling: false
            },
        })

        new events.Rule(this, 'ec2-rules', {
            eventPattern: {
                source: ['aws.ec2'],
                detailType: ['EC2 Instance State-change Notification'],
                detail: {
                    'instance-id': [
                        ec2Instance.instanceId
                    ],
                    state: [
                        'pending',
                        'stopped',
                        'running',
                        'stopping'
                    ]
                }
            },
            targets: [new eventTargets.LambdaFunction(alertStatus)],
            eventBus
        })

        const costProtection = new NodejsFunction(this, 'cost-protection', {
            functionName: buildName('cost-protection'),
            entry: path.join(__dirname, '../../src/minecraft/cost-protection.ts'),
            role: ec2ManagementRoles,
            environment: {
                ...baseEnvironments,
                STOP_LAMBDA_NAME: stopLambda.functionName,
                MC_STATUS_DISCORD_HOOK: props.mcStatusDiscordHook
            },
            bundling: {
                externalModules: ['aws-sdk'],
                forceDockerBundling: false
            },
        })

        const costProtectionRoutine = new events.Rule(this, 'costt-protection-schedule', {
            schedule: events.Schedule.cron({ minute: '0/20' }),
            ruleName: buildName('cost-protection-schedule'),
        })

        costProtectionRoutine.addTarget(new targets.LambdaFunction(costProtection))
    }
}