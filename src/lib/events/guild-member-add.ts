import { ClientEvents } from 'discord.js'
import { BaseEvent } from '../../structures/event'

export class GuildMemberJoin extends BaseEvent {
    public static readonly eventName = 'guildMemberAdd'

    public async execute([ guildMember ]: ClientEvents['guildMemberAdd']) {
        this.client.mainChannel.send(`Hello ${guildMember.nickname || guildMember.displayName}`)
    }
}
