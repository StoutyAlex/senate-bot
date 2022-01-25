import { CommandMeta } from "../../types"
import { Message, MessageEmbed } from 'discord.js'
import { BaseCommand } from "../../structures/command"
import { invokeLambda } from "../../helpers/lambda"
import { ExecuteRconResponse } from "../../minecraft/execute-rcon"

const executeRconLambdaName = process.env.EXECUTE_RCON_LAMBDA_NAME!

export class WallsRun extends BaseCommand {
    public meta: CommandMeta = {
        name: 'walls-run',
        aliases: ['wr']
    }

    public async execute(message: Message, args: string[]) {
        const theboys = message.member?.roles.cache.find(role => role.name === 'Mc-Admin')
        if (!theboys) return message.channel.send('You are not allowed to perform this action.')
        if (!args.length) return message.channel.send('you need to send a command')

        const ftbName = `${executeRconLambdaName}-walls`

        const response = await invokeLambda(ftbName, { command: args.join(' ') }, 'RequestResponse')

        const payload = response.Payload?.toString()
        if (!payload) return message.channel.send('Unable to get valid response from invocation function')

        const rconResponse = JSON.parse(payload) as ExecuteRconResponse

        return await message.channel.send({
            content: 'Command executed!',
            embeds: [
                new MessageEmbed()
                    .addField('Command', rconResponse.command)
                    .addField('Response', rconResponse.response )
                    .setColor('PURPLE')
            ]
        })
    }
} 
