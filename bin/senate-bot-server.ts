import * as cdk from '@aws-cdk/core'
import aws from 'aws-sdk'
import { SenateMinecraftServer } from '../cdk/minecraft-server/senate-mc-server'
import { SenateBot } from '../cdk/senate-bot-stack'
import { SenateValheimServer } from '../cdk/valheim-server/valheim-server'
import { SenateWallsServer } from '../cdk/walls-server/senate-walls-server'

const app = new cdk.App()

const botConfig = app.node.tryGetContext('stackProps')['discordBot']

const minecraftConfig = app.node.tryGetContext('stackProps')['minecraft'] as { 
  rconPasswordArn: string,
  mcStatusDiscordHook: string
}

const ftbConfig = app.node.tryGetContext('stackProps')['ftb'] as { 
  rconPasswordArn: string,
  mcStatusDiscordHook: string
}

const wallsConfig = app.node.tryGetContext('stackProps')['walls'] as { 
  rconPasswordArn: string,
  mcStatusDiscordHook: string
}

const valheimConfig = app.node.tryGetContext('stackProps')['valheim'] as { 
  valheimDiscordHook: string
}

const createStacks = async () => {
  const ssm = new aws.SSM({ region: 'eu-west-1' })
  const passwordResult = await ssm.getParameter({
    Name: '/game-server/minecraft/rcon-password',
    WithDecryption: true
  }).promise()

  const discordBotResult = await ssm.getParameter({
    Name: '/discord-bot/token/prod',
    WithDecryption: true
  }).promise()

  if (!passwordResult.Parameter?.Value || !discordBotResult.Parameter?.Value) throw new Error('Unable to get RCON/DB Token')
  const rconPassword = passwordResult.Parameter.Value
  const botToken = discordBotResult.Parameter.Value
  
  new SenateBot(app, 'senate-bot', {
    ...botConfig,
    botToken,
    stackName: `SenateBotServer`,
  })
  
  new SenateMinecraftServer(app, 'senate-minecraft', {
    rconPassword: rconPassword,
    rconPasswordArn: minecraftConfig.rconPasswordArn,
    mcStatusDiscordHook: minecraftConfig.mcStatusDiscordHook,
    stackName: 'senate-minecraft',
    ftb: false
  })

  new SenateMinecraftServer(app, 'senate-minecraft-ftb', {
    rconPassword: rconPassword,
    rconPasswordArn: ftbConfig.rconPasswordArn,
    mcStatusDiscordHook: ftbConfig.mcStatusDiscordHook,
    stackName: 'senate-minecraft-ftb',
    ftb: true
  })

  new SenateWallsServer(app, 'senate-walls', {
    rconPassword: rconPassword,
    rconPasswordArn: wallsConfig.rconPasswordArn,
    mcStatusDiscordHook: wallsConfig.mcStatusDiscordHook,
    stackName: 'senate-walls'
  })

  new SenateValheimServer(app, 'senate-valheim', {
    stackName: 'senate-valheim',
    valheimDiscordHook: valheimConfig.valheimDiscordHook,
    env: {
      region: 'eu-west-1',
      account: '477948800870'
    }
  })
}

createStacks()