import { CommandMeta } from "../../types"
import { Message } from 'discord.js'
import { BaseCommand } from "../../structures/command"

export class Setup extends BaseCommand {
    public meta: CommandMeta = {
        name: 'setup',
        aliases: []
    }

    // Runs to setup the game servers, channels etc
    public async execute(message: Message, args: string[]) {
        return message.channel.send('Setup')
    }
}
