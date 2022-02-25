import { Channel, Collection, Guild, TextChannel, VoiceChannel } from "discord.js";
import { SenateBot } from "../structures/senate-bot";

// TODO: Handle this not working when there is no general or text channel

export const getGeneralChannel = (client: SenateBot): TextChannel => {
    const textChannels = client.channels.cache.filter(channel => channel.isText()) as Collection<string, TextChannel>
    return textChannels.find(channel => {
        return channel.name === 'general'
    })!
}

export const getTextChannelByName = (client: SenateBot, name: string): TextChannel | undefined => {
    const textChannels = client.channels.cache.filter(channel => channel.isText()) as Collection<string, TextChannel>
    return textChannels.find(channel => {
        return channel.name === name
    })!
}

export const getTextChannelById = (client: SenateBot, id: string): TextChannel | undefined => {
    const textChannels = client.channels.cache.filter(channel => channel.isText()) as Collection<string, TextChannel>
    return textChannels.find(channel => {
        return channel.id === id
    })!
}

export const getVoiceChannelByName = (client: SenateBot, name: string): VoiceChannel | undefined => {
    const voiceChannels = client.channels.cache.filter(channel => channel.isVoice()) as Collection<string, VoiceChannel>
    return voiceChannels.find(channel => {
        return channel.name === name
    })!
}

export const createTextChannel = async (guild: Guild, name: string) => {
    const channel = await guild.channels.create(name, {
        type: 'GUILD_TEXT'
    })

    return channel
}