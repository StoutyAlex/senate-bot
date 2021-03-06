import { CommandMeta } from "../../../types"
import { Message } from 'discord.js'
import { BaseCommand } from "../../../structures/command"
import { invokeLambda } from "../../../helpers/lambda"

const startStopLambda = process.env.START_STOP_MC_LAMBDA_NAME!

export class Minecraft extends BaseCommand {
    public meta: CommandMeta = {
        name: 'minecraft',
        aliases: ['mc']
    }

    public async execute(message: Message, args: string[]) {
        const theboys = message.member?.roles.cache.find(role => role.name.toLowerCase() === 'the boys')
        const egirls = message.member?.roles.cache.find(role => role.name.toLowerCase() === 'e-grills')
        const noMc = message.member?.roles.cache.find(role => role.name === 'no-mc')

        if ((!theboys && !egirls) || noMc) return message.channel.send('You are not allowed to perform this action.')

        if (args[0] === 'start') return this.startServer(message)
        if (args[0] === 'stop') return this.stopServer(message)
    }

    private async startServer(message: Message) {
        try {
            await invokeLambda(startStopLambda, { action: 'start' })
            message.channel.send('Starting server, this could take upto 5 minutes')
        } catch (error) {
            message.channel.send(`Unable to start server: ${error.message}`)
        }
    }

    private async stopServer(message: Message) {
        await invokeLambda(startStopLambda, { action: 'stop' })
        message.channel.send('Stopping server')
    }
} 
