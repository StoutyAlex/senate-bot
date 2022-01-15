import aws from 'aws-sdk'

const rconPasswordArn = process.env.RCON_PASSWORD_ARN!

export const getRconPassword = async () => {
    const secretManager = new aws.SecretsManager({ region: 'eu-west-1' })
    const rconPassword = await secretManager.getSecretValue({ SecretId: rconPasswordArn }).promise()

    return rconPassword.SecretString!
}