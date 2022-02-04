import * as ec2 from "@aws-cdk/aws-ec2";
import * as cdk from '@aws-cdk/core'

export class ValheimSecurityGroup extends ec2.SecurityGroup {

    constructor(scope: cdk.Construct, id: string, props: ec2.SecurityGroupProps) {
        super(scope, id, props)

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(22),
            'allow SSH access from anywhere'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(2456),
            'allow TCP Valheim access from anywhere'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.udp(2456),
            'allow UDP Valheim access from anywhere'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(2457),
            'allow TCP Valheim access from anywhere'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.udp(2457),
            'allow UDP Valheim access from anywhere'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(2458),
            'allow TCP Valheim access from anywhere'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.udp(2458),
            'allow UDP Valheim access from anywhere'
        )

        // Possibly not needed

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            'allow HTTP traffic from anywhere',
        )
    
        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            'allow HTTPS traffic from anywhere',
        )
    }
}