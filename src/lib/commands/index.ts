import { BaseCommand } from '../../structures/command'
import { Ping } from './ping'

const MISC_COMMANDS: typeof BaseCommand[] = [
    Ping
]

export const COMMANDS: typeof BaseCommand[] = [
    ...MISC_COMMANDS
]
