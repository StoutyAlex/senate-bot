import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3'
import * as s3Deploy from '@aws-cdk/aws-s3-deployment'
import * as s3Asset from '@aws-cdk/aws-s3-assets'
import * as path from 'path'
import { readFileSync } from 'fs';
import { CloudFormationInit, EbsDeviceVolumeType, InitFile } from '@aws-cdk/aws-ec2';

export class SenateMinecraftServer extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const buildName = (name: string) => `senate-minecraft-${name}`

        const publicSubnetConfig: ec2.SubnetConfiguration = {
            name: 'PublicSubnet',
            subnetType: ec2.SubnetType.PUBLIC
        }

        const vpc = new ec2.Vpc(this, 'vpc', {
            maxAzs: 2,
            subnetConfiguration: [publicSubnetConfig],
            natGateways: 0
        })

        const serverSecurityGroup = new ec2.SecurityGroup(this, 'security-group', {
            vpc,
            allowAllOutbound: true
        })

        const bucket = new s3.Bucket(this, 'minecraft-backups', {
            bucketName: buildName('storage'),
            removalPolicy: cdk.RemovalPolicy.RETAIN
        })

        new s3Deploy.BucketDeployment(this, 'service-deploy', {
            sources: [s3Deploy.Source.asset(path.join(__dirname))],
            destinationBucket: bucket,
        })

        serverSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(22),
            'allow SSH access from anywhere'
        )

        serverSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(25565),
            'allow TCP Minecraft access from anywhere'
        )

        serverSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.udp(25565),
            'allow UDP Minecraft access from anywhere'
        )

        serverSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            'allow HTTP traffic from anywhere',
        )
    
        serverSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            'allow HTTPS traffic from anywhere',
        )

        const role = new iam.Role(this, 'server-role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
            ]
        })

        bucket.grantReadWrite(role)

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

        const dataScript = readFileSync(path.join(__dirname, 'user-data.sh'), 'utf8')

        ec2Instance.addUserData(dataScript)
    }
}