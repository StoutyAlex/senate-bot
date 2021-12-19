import { Message } from "discord.js"
import { logger } from "senate-bot-common"
import { commandHandler } from "../../../src/lib/command-handler"
import { BotConfig } from "../../../src/lib/configuration/config-helper"
import { MessageCreate } from "../../../src/lib/events/message-create"
import { SenateBot } from "../../../src/structures/senate-bot"
import { Stage } from "../../../src/types"
import { fixtureMessage } from "../../fixtures/message-fixture"

jest.mock('../../../src/lib/command-handler')
jest.mock('senate-bot-common')

const mockCommandHandler = commandHandler as jest.Mock

const botConfig: BotConfig = {
    botTokenId: '',
    prefix: 'sheev',
    stage: Stage.LOCAL
}

describe('Message Create', () => {
    let mockMessage: Message
    let mockBot: SenateBot

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
        jest.resetModules()

        mockBot = new SenateBot({ config: botConfig, commands: [], events: {} })
        mockMessage = fixtureMessage()
    })

    test('Calls command handler with message', async () => {
        const botCommandMessage = fixtureMessage({ content: botConfig.prefix })
        const messageCreate = new MessageCreate(mockBot)

        await messageCreate.execute([botCommandMessage])

        expect(mockCommandHandler).toHaveBeenCalled()
    })

    test('does not call command handler with message that isnt prefixed', async () => {
        const regularMessage = fixtureMessage({ content: 'regular message' })
        const messageCreate = new MessageCreate(mockBot)

        await messageCreate.execute([regularMessage])

        expect(mockCommandHandler).not.toHaveBeenCalled()
    })

    test('does not call command handler with bot message', async () => {
        const botCommandMessage = fixtureMessage({ content: botConfig.prefix, author: { bot: true } })
        const messageCreate = new MessageCreate(mockBot)

        await messageCreate.execute([botCommandMessage])

        expect(mockCommandHandler).not.toHaveBeenCalled()
    })

    test('Logs message when message recieved', async () => {
        const message = fixtureMessage()
        const messageCreate = new MessageCreate(mockBot)

        await messageCreate.execute([message])

        expect(logger.info).toHaveBeenCalledWith('Message recieved', { content: message.content })
    })
})
