import { Collection, TextChannel } from "discord.js";
import { SenateBot } from "../structures/senate-bot";

// TODO: Handle this not working when there is no general or text channel

export const getGeneralChannel = (client: SenateBot): TextChannel => {
    const textChannels = client.channels.cache.filter(channel => channel.isText()) as Collection<string, TextChannel>
    return textChannels.find(channel => {
        return channel.name === 'general'
    })!
}