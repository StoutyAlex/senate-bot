import faker from 'faker'
import { getToken } from "../../../src/lib/configuration/secrets"
import { Stage } from "../../../src/types"

describe('Secrets', () => {
    let mockSecretValue: string
    
    beforeEach(() => {
        jest.clearAllMocks()
        jest.restoreAllMocks()
        jest.resetModules()

        mockSecretValue = faker.random.alphaNumeric(15)
    })

    describe('getToken', () => {
        test('Returns a local environment variable when on local', async () => {
            process.env.DISCORD_TOKEN = mockSecretValue

            const token = await getToken()

            expect(token).toBe(mockSecretValue)
        })
    })
})
