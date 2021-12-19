import { Client } from "discord.js";
import { baseConfig } from "../../src/lib/configuration/config-helper";
import { SenateBot } from "../../src/structures/senate-bot"

jest.mock('discord.js')

const loginMock = (Client.prototype.login as jest.Mock)

describe('Senate bot', () => {

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()
        jest.resetAllMocks()
    })

    test('Logs in to discord given token', async () => {
        const bot = new SenateBot({ config: baseConfig.local, commands: [], events: {} })
        const token = 'token'

        await bot.start(token)

        expect(loginMock).toHaveBeenCalledWith(token)
    })
})
