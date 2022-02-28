import { CostExplorerClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer"
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import axios from "axios"
import webhook from 'webhook-discord'

const costExplorer = new CostExplorerClient({ region: 'eu-west-1' })
const ssmClient = new SSMClient({ region: 'eu-west-1' })

export const handler = async () => {
    const date = new Date()
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)

    const costAndUsage = await costExplorer.send(new GetCostAndUsageCommand({
        TimePeriod: {
          Start: firstDay.toISOString().split('T')[0],
          End: date.toISOString().split('T')[0]
        },
        Granularity: 'MONTHLY',
        Metrics: ['AmortizedCost']
    }))

    if (!costAndUsage.ResultsByTime?.length || !costAndUsage.ResultsByTime[0].Total) {
        throw new Error('Unable to get cost and time')
    }

    const amortizedCost = costAndUsage.ResultsByTime[0].Total['AmortizedCost']
    if (!amortizedCost) {
        throw new Error('Unable to get AmortizedCost')
    }

    const paypalLink = await ssmClient.send(new GetParameterCommand({ Name: '/paypal/alex' }))
    const apiKeyCostConvert = await ssmClient.send(new GetParameterCommand({ Name: '/api-key/currency-convert', WithDecryption: true }))
    const senateBillWebhook = await ssmClient.send(new GetParameterCommand({ Name:'/webhook/discord/general', WithDecryption: true }))

    if (!paypalLink.Parameter?.Value || !apiKeyCostConvert.Parameter?.Value || !senateBillWebhook.Parameter?.Value) {
        throw new Error('Unable to fetch all parametrs in parameter store')
    }

    const formatQuery = `${amortizedCost.Unit!}_GBP`

    const currencyConversionResult = await axios.get('https://free.currconv.com/api/v7/convert', {
        params: {
            q: formatQuery,
            compact: 'ultra',
            apiKey: apiKeyCostConvert.Parameter.Value,
        }
    })

    const conversionValue = currencyConversionResult.data[formatQuery] as number
    const priceInGBP = Number(amortizedCost.Amount!) * conversionValue

    const hook = new webhook.Webhook(senateBillWebhook.Parameter.Value)

    const message = new webhook.MessageBuilder()
        .setName('Senate Billing')
        .setColor('#00AA00')
        .setText(`<@&623626412254822423>`)
        .setTitle('Click here to contribute')
        .addField('Total Cost', `£${Math.ceil(priceInGBP)}`)
        .setDescription("Game Servers are pay as we use.\nIf you're feeling generious feel free to help cover the costs")
        .setURL(paypalLink.Parameter.Value)

    await hook.send(message)
}
