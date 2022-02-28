import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import * as path from 'path'
import * as events from '@aws-cdk/aws-events'
import * as eventTargets from '@aws-cdk/aws-events-targets'
import { readFileSync } from 'fs';
import { EbsDeviceVolumeType } from '@aws-cdk/aws-ec2';
import { ValheimSecurityGroup } from './valheim-security';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs'

export interface SenateValheimServerProps extends cdk.StackProps {
    valheimDiscordHook: string
}

export class SenateValheimServer extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: SenateValheimServerProps) {
        super(scope, id, props)

        const buildName = (name: string) => `senate-valheim-${name}`

        const eventBus = events.EventBus.fromEventBusName(this, 'default-bus', 'default')

        const vpc = ec2.Vpc.fromLookup(this, 'vpc', {
            isDefault: true,
            region: 'eu-west-1'
        })

        const serverSecurityGroup = new ValheimSecurityGroup(this, 'security-group', {
            vpc,
            allowAllOutbound: true,
        })

        const role = new iam.Role(this, 'server-role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
            ]
        })

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
            machineImage: ec2.MachineImage.genericLinux({
                'eu-west-1': 'ami-08ca3fed11864d6bb'
            }),
            keyName: 'minecraft-key',
        })

        eventBus.grantPutEventsTo(ec2Instance)

        const datascriptPath = 'user-data.sh'

        const dataScript = readFileSync(path.join(__dirname, datascriptPath), 'utf8')
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
           INSTANCE_ID: ec2Instance.instanceId,
        }

        const stopLambda = new NodejsFunction(this, 'stop-lambda', {
            functionName: buildName('stop'),
            entry: path.join(__dirname, '../../src/valheim/stop-server.ts'),
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
    
        new NodejsFunction(this, 'stop-start-lambda', {
            functionName: buildName('start-stop'),
            entry: path.join(__dirname, '../../src/valheim/start-stop-server.ts'),
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
            entry: path.join(__dirname, '../../src/valheim/alert-server-status.ts'),
            role: ec2ManagementRoles,
            environment: {
                ...baseEnvironments,
                DISCORD_HOOK: props.valheimDiscordHook
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
    }
}