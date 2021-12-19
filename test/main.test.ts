import { secrets } from "../src/lib/configuration"
import { run } from "../src/index"
import { SenateBot } from "../src/structures/senate-bot"
import faker from 'faker'

jest.mock('../src/structures/senate-bot')
jest.mock('../src/lib/configuration')

const mockStartBot = (SenateBot.prototype.start as jest.Mock)
const mockGetToken = (secrets.getToken as jest.Mock)

describe('Main', () => {
    const token = faker.datatype.uuid()

    beforeEach(() => {
        jest.resetAllMocks()
        jest.clearAllMocks()
        jest.resetModules()

        mockGetToken.mockReturnValue(token)        
    })

    test('bot logs in with token', async () => {
        await run()

        expect(mockStartBot).toHaveBeenCalledWith(token)
    })
})
