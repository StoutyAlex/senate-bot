import { commandHandler } from "../../../src/lib/command-handler"
import { BotConfig } from "../../../src/lib/configuration/config-helper"
import { SenateBot } from "../../../src/structures/senate-bot"
import { Stage } from "../../../src/types/index.d."
import { FixtureCommand } from "../../fixtures/command-fixture"
import { Message } from 'discord.js'
import { fixtureCommandMessage } from "../../fixtures/message-fixture"
import { Ping } from "../../../src/lib/commands/ping"

const mockExecute = jest.fn()
FixtureCommand.prototype.execute = mockExecute

const botConfig: BotConfig = {
    botTokenId: '',
    prefix: 'sheev',
    stage: Stage.LOCAL
}

describe('Ping Command', () => {
    let bot: SenateBot
    let message: Message
    let ping: Ping
    
    beforeEach(() => {
        jest.resetAllMocks()
        jest.clearAllMocks()
        jest.resetModules()

        bot = new SenateBot({ config: botConfig, commands: [], events: {} })
        ping = new Ping(bot)
        message = fixtureCommandMessage(ping)
    })

    test('Executes base exectue function', async () => {
        await ping.execute(message, [])

        expect(message.channel.send).toHaveBeenCalledWith('Pong!')
    })
})
