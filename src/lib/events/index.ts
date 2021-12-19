
import { Events } from '../../types'
import { MessageCreate } from './message-create'

export const EVENTS: Events = {
    [MessageCreate.eventName]: MessageCreate,
}
