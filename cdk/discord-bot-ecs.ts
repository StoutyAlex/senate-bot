import * as cdk from '@aws-cdk/core'
import * as ec2 from "@aws-cdk/aws-ec2"
import * as iam from '@aws-cdk/aws-iam'
import * as ecs from "@aws-cdk/aws-ecs"
import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
import path from 'path';
import { Stage } from './senate-bot-stack';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import { SecurityGroup } from '@aws-cdk/aws-ec2';

export interface SenateECSContainerProps {
    stackName: (x: string) => string
    constructName: (x: string) => string
    stage: Stage,
    botToken: string,
    environment?: Record<string, string>
}

export class SenateECSContainer extends cdk.Construct {

    public image: DockerImageAsset
    public role: iam.IRole

    constructor(scope: cdk.Construct, id: string, props: SenateECSContainerProps) {
        super(scope, id)

        const { stackName, botToken, constructName, stage, environment = {} } = props

        const publicSubnetConfig: ec2.SubnetConfiguration = {
            name: 'PublicSubnet',
            subnetType: ec2.SubnetType.PUBLIC
        }

        const vpc = new ec2.Vpc(this, stackName('vpc'), {
            maxAzs: 2,
            subnetConfiguration: [publicSubnetConfig],
            natGateways: 0
        })

        vpc.addGatewayEndpoint(stackName('ddb-vpc-endpoint'), {
            service: ec2.GatewayVpcEndpointAwsService.DYNAMODB
        })

        this.image = new ecrAssets.DockerImageAsset(this, stackName('image'), {
            directory: path.join(__dirname, '..'),
            buildArgs: {
                ...{} // TODO: Add args
            }
        })

        const taskDefinition = new ecs.Ec2TaskDefinition(this, stackName('task'))

        taskDefinition.addContainer(stackName('container'), {
            image: ecs.ContainerImage.fromDockerImageAsset(this.image),
            memoryLimitMiB: 512,
            portMappings: [{
                containerPort: 3000,
                hostPort: 3000
            }],
            containerName: 'senate-bot-instance',
            cpu: 1,
            environment: {
                STAGE: stage,
                DISCORD_TOKEN: botToken,
                ...environment
            },
            logging: ecs.LogDrivers.awsLogs({
                streamPrefix: 'senate-bot'
            })
        })
        
        const cluster = new ecs.Cluster(this, stackName('cluster'), {
            clusterName: constructName('cluster'),
            vpc
        })

        const group = cluster.addCapacity(stackName('scaling-group'), {
            instanceType: new ec2.InstanceType('t2.micro'),
            machineImageType: ecs.MachineImageType.AMAZON_LINUX_2,
            desiredCapacity: 1,
            associatePublicIpAddress: true,
            vpcSubnets: {
                onePerAz: true,
                subnetType: ec2.SubnetType.PUBLIC
            }
        })

        const securityGroup = new SecurityGroup(this, stackName('security-group'), {
            securityGroupName: constructName('security-group'),
            allowAllOutbound: true,
            vpc
        })

        securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(22),
            'allow SSH access from anywhere'
        )

        securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(3000),
            'allow HTTP for the server'
        )

        group.addSecurityGroup(securityGroup)

        const service = new ecs.Ec2Service(this, stackName('service'), {
            serviceName: 'senate-bot-instance',
            cluster,
            taskDefinition,
            daemon: true
        })

        this.image.repository.grantPull(service.taskDefinition.taskRole)

        this.role = taskDefinition.taskRole
    }
}