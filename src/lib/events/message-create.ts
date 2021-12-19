import { ClientEvents } from 'discord.js'
import { BaseEvent } from '../../structures/event'
import { commandHandler } from '../command-handler'

export class MessageCreate extends BaseEvent {
    public static readonly eventName = 'messageCreate'

    public async execute([ message ]: ClientEvents['messageCreate']) {
        if (message.author.bot) return

        console.log('Message recieved', { content: message.content })

        if (message.content.toLowerCase().startsWith(this.client.config.prefix))
            commandHandler(this.client, message)
    }
}
