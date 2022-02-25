import 'dotenv/config'
import { getApiConfig, getBotConfig } from './lib/configuration/config-helper'
import { secrets } from './lib/configuration'
import { SenateBot } from './structures/senate-bot'
import { COMMANDS } from './lib/commands'
import { EVENTS } from './lib/events'
import { Api } from './structures/api'

const config = getBotConfig()
const apiConfig = getApiConfig()

const client = new SenateBot({ config, commands: COMMANDS, events: EVENTS })
const api = new Api(client)

api.app.get('/status', (req, res) => {
    res.send('OK')
})

api.app.post('/message', (req, res) => {
    req.client.send(req.body.message)
    res.status(200).send()
})

export const run = async () => {
    const token = await secrets.getToken()
    await client.start(token)

    api.listen(apiConfig.port)
}

run()
