import { CommandMeta } from "../../types"
import { Message } from 'discord.js'
import { BaseCommand } from "../../structures/command"
import { getTextChannelByName, getVoiceChannelByName } from "../../helpers/channel"
import get from 'lodash/get'

export class Tribunal extends BaseCommand {
    public meta: CommandMeta = {
        name: 'tribunal',
        aliases: ['court']
    }

    public async execute(message: Message, args: string[]) {
        const theboys = message.member?.roles.cache.find(role => role.name === 'The Boys')
        if (!theboys) return message.channel.send('You are not allowed to perform this action.')

        const channelToMoveFrom = get(message,'member.voice.channel.name', null) as string | undefined
        if (!channelToMoveFrom) return message.channel.send('You need to be in a voice channel!')

        const evidence = getTextChannelByName(this.client, 'evidence')
        const court = getVoiceChannelByName(this.client, 'Court Room')

        return
    }
} 
