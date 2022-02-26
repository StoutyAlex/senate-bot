
import { Events } from '../../types'
import { GuildMemberJoin } from './guild-member-add'
import { InteractionCreate } from './interaction-create'
import { MessageCreate } from './message-create'
import { VoiceStateUpdate } from './voice-state-update'

export const EVENTS: Events = {
    [MessageCreate.eventName]: MessageCreate,
    [GuildMemberJoin.eventName]: GuildMemberJoin,
    [VoiceStateUpdate.eventName]: VoiceStateUpdate,
    [InteractionCreate.eventName]: InteractionCreate
}
