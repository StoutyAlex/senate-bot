import { Message } from "discord.js";
import { AbstractCommand, CommandMeta } from "../types";

class BaseCommand extends AbstractCommand {
    public meta: CommandMeta = {
        name: 'base',
        aliases: []
    }

    public async execute(message: Message, args: string[]): Promise<any> {
        return message.channel.send('Command not implemented')
    }
}

export { BaseCommand };
