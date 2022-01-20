import { Voice } from "aws-sdk/clients/polly";
import { Collection, TextChannel, VoiceChannel } from "discord.js";
import { SenateBot } from "../structures/senate-bot";

// TODO: Handle this not working when there is no general or text channel

export const getGeneralChannel = (client: SenateBot): TextChannel => {
    const textChannels = client.channels.cache.filter(channel => channel.isText()) as Collection<string, TextChannel>
    return textChannels.find(channel => {
        return channel.name === 'general'
    })!
}

export const getTextChannelByName = (client: SenateBot, name: string): TextChannel => {
    const textChannels = client.channels.cache.filter(channel => channel.isText()) as Collection<string, TextChannel>
    return textChannels.find(channel => {
        return channel.name === name
    })!
}

export const getVoiceChannelByName = (client: SenateBot, name: string): VoiceChannel => {
    const voiceChannels = client.channels.cache.filter(channel => channel.isVoice()) as Collection<string, VoiceChannel>
    return voiceChannels.find(channel => {
        return channel.name === name
    })!
}