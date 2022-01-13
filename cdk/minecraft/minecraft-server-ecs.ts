import * as cdk from '@aws-cdk/core'
import * as ec2 from "@aws-cdk/aws-ec2"
import * as iam from '@aws-cdk/aws-iam'
import * as ecs from "@aws-cdk/aws-ecs"
import * as ecrAssets from '@aws-cdk/aws-ecr-assets';
import path from 'path';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import { Scope } from '@aws-cdk/aws-ecs';

export interface SenateMCECSContainerProps {
    buildName: (x: string) => string
}

export class SenateMCECSContainer extends cdk.Construct {

    public image: DockerImageAsset
    public role: iam.IRole

    constructor(scope: cdk.Construct, id: string, props: SenateMCECSContainerProps) {
        super(scope, id)

        const { buildName } = props

        const publicSubnetConfig: ec2.SubnetConfiguration = {
            name: 'PublicSubnet',
            subnetType: ec2.SubnetType.PUBLIC
        }

        const vpc = new ec2.Vpc(this, buildName('vpc'), {
            maxAzs: 2,
            subnetConfiguration: [publicSubnetConfig],
            natGateways: 0
        })

        vpc.addGatewayEndpoint(buildName('ddb-vpc-endpoint'), {
            service: ec2.GatewayVpcEndpointAwsService.DYNAMODB
        })

        this.image = new ecrAssets.DockerImageAsset(this, buildName('image'), {
            directory: path.join(__dirname, '../..'),
            file: 'Dockerfile.minecraft',
            buildArgs: {
                ...{} // TODO: Add args
            }
        })

        const taskDefinition = new ecs.Ec2TaskDefinition(this, buildName('task'))

        const container = taskDefinition.addContainer(buildName('container'), {
            image: ecs.ContainerImage.fromDockerImageAsset(this.image),
            memoryLimitMiB: 3500,
            cpu: 2,
            logging: ecs.LogDrivers.awsLogs({
                streamPrefix: 'senateMC-bot'
            })
        })

        taskDefinition.addVolume({
            name: 'volume-test',
            dockerVolumeConfiguration: {
                autoprovision: true,
                scope: Scope.SHARED,
                driver: 'rexray/ebs',
                driverOpts: {
                    volumetype: 'gp2',
                    size: '1'
                }
            }
        })
        
        container.addMountPoints({
            sourceVolume: 'volume-test',
            containerPath: '/home/mcserver',
            readOnly: false
        })

        const cluster = new ecs.Cluster(this, buildName('cluster'), {
            clusterName: buildName('cluster'),
            vpc
        })

        cluster.addCapacity(buildName('scaling-group'), {
            instanceType: new ec2.InstanceType('t2.medium'),
            machineImageType: ecs.MachineImageType.AMAZON_LINUX_2,
            desiredCapacity: 1,
            associatePublicIpAddress: true,
            vpcSubnets: {
                onePerAz: true,
                subnetType: ec2.SubnetType.PUBLIC
            }
        })

        const service = new ecs.Ec2Service(this, buildName('service'), {
            cluster,
            taskDefinition,
            daemon: true
        })

        this.image.repository.grantPull(service.taskDefinition.taskRole)

        this.role = taskDefinition.taskRole
    }
}