import { CommandMeta } from "../../../types"
import { Message } from 'discord.js'
import { BaseCommand } from "../../../structures/command"

export class Play extends BaseCommand {
    public meta: CommandMeta = {
        name: 'play',
        aliases: ['play']
    }

    public async execute(message: Message, args: string[]) {
        console.log('execute play', message.content)

        
        return message.channel.send('Pong!')
    }
}
