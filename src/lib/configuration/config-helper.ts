import 'dotenv/config'
import { Stage } from '../../types'


export interface BotConfig {
    botTokenId: string
    stage: Stage
    prefix: string
}

export const baseConfig: { [stage in Stage]: BotConfig } = {
    local: {
        botTokenId: '',
        stage: Stage.LOCAL,
        prefix: 'sheev-local'
    },
    dev: {
        botTokenId: 'senate-bot-token-dev',
        stage: Stage.DEV,
        prefix: 'sheev-dev'
    },
    prod: {
        botTokenId: 'senate-bot-token',
        stage: Stage.PROD,
        prefix: 'sheev'
    }
}

export const getBotConfig = (): BotConfig => {
    const stage = process.env.STAGE as Stage
    return baseConfig[stage]
}