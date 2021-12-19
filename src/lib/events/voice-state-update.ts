import { ClientEvents } from 'discord.js'
import { BaseEvent } from '../../structures/event'

export class VoiceStateUpdate extends BaseEvent {
    public static readonly eventName = 'voiceStateUpdate'

    public async execute([ oldState, newState ]: ClientEvents['voiceStateUpdate']) {
        console.log(oldState.channel, newState.member?.nickname)
        if (!oldState.channel && newState.member) {
            this.client.mainChannel.send(`Moved ${newState.member.nickname}`)
        }
    }
}
