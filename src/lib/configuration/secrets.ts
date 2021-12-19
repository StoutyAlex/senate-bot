import { SecretsManager } from "aws-sdk";
import { BotConfig } from "./config-helper";

const secretManager = new SecretsManager({
    region: 'eu-west-1'
})

const getSecretString = async (secretId: string): Promise<string> => {
    try {
        const result = await secretManager.getSecretValue({
            SecretId: secretId
        }).promise()

        return result.SecretString as string;
    } catch (error) {
        console.error('Unable to fetch token', { secretId })
        throw new Error('Token was not found in secrets')
    }
}

export const getToken = async (config: BotConfig): Promise<string> => {
    return process.env.DISCORD_TOKEN!
    // if (config.stage === 'local') return process.env.DISCORD_TOKEN!
    // return await getSecretString(config.botTokenId)
}
