
import { Events } from '../../types'
import { GuildMemberJoin } from './guild-member-add'
import { MessageCreate } from './message-create'
import { VoiceStateUpdate } from './voice-state-update'

export const EVENTS: Events = {
    [MessageCreate.eventName]: MessageCreate,
    [GuildMemberJoin.eventName]: GuildMemberJoin,
    [VoiceStateUpdate.eventName]: VoiceStateUpdate
}
