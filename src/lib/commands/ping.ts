import { CommandMeta } from "../../types"
import { Message } from 'discord.js'
import { BaseCommand } from "../../structures/command"

export class Ping extends BaseCommand {
    public meta: CommandMeta = {
        name: 'ping',
        aliases: ['p']
    }

    public async execute(message: Message, args: string[]) {
        console.log('execute ping', message.content)
        return message.channel.send('Pong!')
    }
}
