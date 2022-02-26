import { CategoryChannel, Collection, Guild, TextChannel, VoiceChannel } from "discord.js";

// TODO: Handle this not working when there is no general or text channel

export const getGeneralChannel = (guild: Guild): TextChannel => {
    const textChannels = guild.channels.cache.filter(channel => channel.isText()) as Collection<string, TextChannel>
    return textChannels.find(channel => {
        return channel.name === 'general'
    })!
}

export const getTextChannelByName = (guild: Guild, name: string): TextChannel | undefined => {
    const textChannels = guild.channels.cache.filter(channel => channel.isText()) as Collection<string, TextChannel>
    return textChannels.find(channel => {
        return channel.name === name
    })
}

export const getTextChannelById = (guild: Guild, id: string): TextChannel | undefined => {
    const textChannels = guild.channels.cache.filter(channel => channel.isText()) as Collection<string, TextChannel>
    return textChannels.find(channel => {
        return channel.id === id
    })
}

export const getCategoryByName = (guild: Guild, name: string): CategoryChannel | undefined => {
    const categories = guild.channels.cache.filter(channel => channel.type === 'GUILD_CATEGORY') as Collection<string, CategoryChannel>
    return categories.find(channel => {
        return channel.name.toLowerCase() === name.toLowerCase()
    })
}

export const getVoiceChannelByName = (guild: Guild, name: string): VoiceChannel | undefined => {
    const voiceChannels = guild.channels.cache.filter(channel => channel.isVoice()) as Collection<string, VoiceChannel>
    return voiceChannels.find(channel => {
        return channel.name === name
    })
}

export const createTextChannel = async (guild: Guild, name: string) => {
    const channel = await guild.channels.create(name, {
        type: 'GUILD_TEXT'
    })

    return channel
}

export const createCategoryChannel = async (guild: Guild, name: string) => {
    const channel = await guild.channels.create(name, {
        type: 'GUILD_CATEGORY'
    })

    return channel
}