import * as ec2 from "@aws-cdk/aws-ec2";
import * as cdk from '@aws-cdk/core'

export interface SenateMCSecurityGroupProps extends ec2.SecurityGroupProps {
    rconPort: number,
    mcPort: number,
}

export class SenateMCSecurityGroup extends ec2.SecurityGroup {

    public rconPort: number
    public mcPort: number

    constructor(scope: cdk.Construct, id: string, props: SenateMCSecurityGroupProps) {
        super(scope, id, props)

        this.rconPort = props.rconPort
        this.mcPort = props.mcPort

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(22),
            'allow SSH access from anywhere'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(props.mcPort),
            'allow TCP Minecraft access from anywhere'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.udp(props.mcPort),
            'allow UDP Minecraft access from anywhere'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.udp(props.rconPort),
            'allow RCON Minecraft access from anywhere'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(props.rconPort),
            'allow RCON Minecraft access from anywhere'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.udp(21),
            'FTP UDP'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(21),
            'FTP TCP'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.udp(20),
            'FTP UDP'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(20),
            'FTP TCP'
        )

        this.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcpRange(1024, 1048),
            'FTP Data'
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