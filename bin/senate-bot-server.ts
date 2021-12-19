import * as cdk from '@aws-cdk/core'
import { SenateBot } from '../cdk/senate-bot-stack'

const app = new cdk.App()
const stage = app.node.tryGetContext('stage') || 'dev'

if (!stage || !['dev', 'prod'].includes(stage)) {
  console.error('-c stage={dev | prod} is required, defaulting to dev')
}

const appConfig = app.node.tryGetContext('stackProps')[stage]

new SenateBot(app, 'senate-bot-dev', {
  ...appConfig,
  stackName: `SenateBotServer-dev`,
})

new SenateBot(app, 'senate-bot', {
  ...appConfig,
  stackName: `SenateBotServer`,
})