import * as cdk from '@aws-cdk/core'
import { SenateMCECSContainer } from './minecraft-server-ecs';

export class SenateMinecraft extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props)

        const buildName = (name: string) => `senate-mc-${name}`
        
        const minecraftServer = new SenateMCECSContainer(this, buildName('ecs-server'), {
            buildName
        })
    }
}
