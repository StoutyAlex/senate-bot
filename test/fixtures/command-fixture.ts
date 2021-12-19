import { Message } from "discord.js";
import { AbstractCommand, CommandMeta } from "../../src/types";

export const FixtureMeta: CommandMeta = {
    name: 'test',
    aliases: ['t'] as const
} as const

export class FixtureCommand extends AbstractCommand {
    public meta: CommandMeta = FixtureMeta

    public async execute(message: Message, args: string[]): Promise<any> {
        return
    }
}
