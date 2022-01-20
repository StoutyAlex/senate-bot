import * as cdk from '@aws-cdk/core'
import aws from 'aws-sdk'
import { SenateMinecraftServer, SenateMinecraftServerProps } from '../cdk/minecraft-server/senate-mc-server'
import { SenateBot } from '../cdk/senate-bot-stack'

const app = new cdk.App()
const stage = app.node.tryGetContext('stage') || 'dev'

if (!stage || !['dev', 'prod'].includes(stage)) {
  console.error('-c stage={dev | prod} is required, defaulting to dev')
}

const appConfig = app.node.tryGetContext('stackProps')[stage]
const minecraftConfig = app.node.tryGetContext('stackProps')['minecraft'] as { 
  rconPasswordArn: string,
  mcStatusDiscordHook: string
}

const ftbConfig = app.node.tryGetContext('stackProps')['ftb'] as { 
  rconPasswordArn: string,
  mcStatusDiscordHook: string
}

const createStacks = async () => {
  const secretManager = new aws.SecretsManager({ region: 'eu-west-1' })
  const rconPassword = await secretManager.getSecretValue({ SecretId: minecraftConfig.rconPasswordArn }).promise()

  new SenateBot(app, 'senate-bot-dev', {
    ...appConfig,
    stackName: `SenateBotServer-dev`,
  })
  
  new SenateBot(app, 'senate-bot', {
    ...appConfig,
    stackName: `SenateBotServer`,
  })
  
  new SenateMinecraftServer(app, 'senate-minecraft', {
    rconPassword: rconPassword.SecretString!,
    rconPasswordArn: minecraftConfig.rconPasswordArn,
    mcStatusDiscordHook: minecraftConfig.mcStatusDiscordHook,
    stackName: 'senate-minecraft',
    ftb: false
  })

  new SenateMinecraftServer(app, 'senate-minecraft-ftb', {
    rconPassword: rconPassword.SecretString!,
    rconPasswordArn: ftbConfig.rconPasswordArn,
    mcStatusDiscordHook: ftbConfig.mcStatusDiscordHook,
    stackName: 'senate-minecraft-ftb',
    ftb: true
  })
}

createStacks()