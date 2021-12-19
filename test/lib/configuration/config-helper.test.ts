import { baseConfig, getBotConfig } from '../../../src/lib/configuration/config-helper'

describe('Config Helper', () => {
    describe('getBotConfig', () => {
        test('returns dev config when stage is dev', () => {
            process.env.STAGE = 'dev'

            const config = getBotConfig()

            expect(config).toEqual(baseConfig.dev)
        })

        test('returns local config when stage is dev', () => {
            process.env.STAGE = 'local'

            const config = getBotConfig()

            expect(config).toEqual(baseConfig.local)
        })

        test('returns prod config when stage is dev', () => {
            process.env.STAGE = 'prod'

            const config = getBotConfig()

            expect(config).toEqual(baseConfig.prod)
        })
    })
})
