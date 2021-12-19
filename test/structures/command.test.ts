import { commandHandler } from "../../src/lib/command-handler"
import { BotConfig } from "../../src/lib/configuration/config-helper"
import { BaseCommand } from "../../src/structures/command"
import { SenateBot } from "../../src/structures/senate-bot"
import { Stage } from "../../src/types"
import { FixtureCommand } from "../fixtures/command-fixture"
import { Message } from 'discord.js'
import { fixtureMessage } from "../fixtures/message-fixture"

const mockExecute = jest.fn()
FixtureCommand.prototype.execute = mockExecute

const botConfig: BotConfig = {
    botTokenId: '',
    prefix: 'sheev',
    stage: Stage.LOCAL
}

describe('Command handler', () => {
    let bot: SenateBot
    let message: Message
    let baseCommand: BaseCommand
    
    beforeEach(() => {
        jest.resetAllMocks()
        jest.clearAllMocks()
        jest.resetModules()

        message = fixtureMessage()

        bot = new SenateBot({ config: botConfig, commands: [], events: {} })
        baseCommand = new BaseCommand(bot)
    })

    test('Executes base exectue function', async () => {
        commandHandler(bot, message)

        await baseCommand.execute(message, [])

        expect(message.channel.send).toHaveBeenCalled()
    })
})
