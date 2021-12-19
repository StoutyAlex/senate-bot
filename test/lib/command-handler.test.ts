import { commandHandler } from "../../src/lib/command-handler"
import { BotConfig } from "../../src/lib/configuration/config-helper"
import { SenateBot } from "../../src/structures/senate-bot"
import { Stage } from "../../src/types"
import { FixtureCommand, FixtureMeta } from "../fixtures/command-fixture"
import { Message } from 'discord.js'
import { fixtureMessage } from "../fixtures/message-fixture"
import { BaseCommand } from "../../src/structures/command"

const mockExecute = jest.fn()
FixtureCommand.prototype.execute = mockExecute

const botConfig: BotConfig = {
    botTokenId: '',
    prefix: 'sheev',
    stage: Stage.LOCAL
}

describe('Command handler', () => {
    let bot: SenateBot
    let commands: typeof BaseCommand[]
    let message: Message
    
    beforeEach(() => {
        jest.resetAllMocks()
        jest.clearAllMocks()
        jest.resetModules()

        commands = [
            FixtureCommand
        ]

        message = fixtureMessage({ content: `sheev ${FixtureMeta.name}` })

        bot = new SenateBot({ config: botConfig, commands, events: {} })
    })

    test('Does not call command when message does not match prefix', () => {
        commandHandler(bot, fixtureMessage())

        expect(mockExecute).not.toHaveBeenCalled()
    })

    test('Does not call command when message no command passed', () => {
        commandHandler(bot, fixtureMessage({ content: 'sheev' }))

        expect(mockExecute).not.toHaveBeenCalled()
    })

    test('Does call command when message matches prefix', () => {
        commandHandler(bot, message)

        expect(mockExecute).toHaveBeenCalledWith(message, [])
    })

    test('Does call command when message matches alias', () => {
        message = fixtureMessage({ content: `sheev ${FixtureMeta.aliases[0]}`})

        commandHandler(bot, message)

        expect(mockExecute).toHaveBeenCalledWith(message, [])
    })

    test('Does call command when message matches prefix and args', () => {
        message = fixtureMessage({ content: `sheev ${FixtureMeta.name} hello world` })

        commandHandler(bot, message)

        expect(mockExecute).toHaveBeenCalledWith(message, ['hello', 'world'])
    })
})
