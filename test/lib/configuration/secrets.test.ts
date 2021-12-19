import { SecretsManager } from "aws-sdk"
import faker from 'faker'
import { BotConfig } from "../../../src/lib/configuration/config-helper"
import { getToken } from "../../../src/lib/configuration/secrets"
import { Stage } from "../../../src/types"

jest.mock('aws-sdk')

const mockGetSecretValue = jest.fn()
SecretsManager.prototype.getSecretValue = mockGetSecretValue

const config: BotConfig = {
    botTokenId: faker.datatype.uuid(),
    stage: Stage.PROD,
    prefix: faker.random.word()
}

describe('Secrets', () => {
    let mockSecretValue: String
    
    beforeEach(() => {
        jest.clearAllMocks()
        jest.restoreAllMocks()
        jest.resetModules()

        mockSecretValue = faker.random.alphaNumeric(10)

        mockGetSecretValue.mockReturnValue({ promise: jest.fn().mockResolvedValue({ SecretString: mockSecretValue }) })
    })

    describe('getToken', () => {
        test('Returns valid token', async () => {
            const token = await getToken(config)

            expect(mockGetSecretValue).toHaveBeenCalledWith({ SecretId: config.botTokenId })
            expect(token).toBe(mockSecretValue)
        })

        test('Throws error when token can not be found', async () => {
            mockGetSecretValue.mockImplementation(() => new Error() )

            await expect(getToken(config)).rejects.toThrow('Token was not found in secrets')
        })

        test('Returns a local environment variable when on local', async () => {
            process.env.BOT_TOKEN = 'token-local'

            const token = await getToken({ ...config, stage: Stage.LOCAL })

            expect(mockGetSecretValue).not.toHaveBeenCalled()
            expect(token).toBe('token-local')
        })
    })
})
