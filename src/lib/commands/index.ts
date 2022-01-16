import { BaseCommand } from '../../structures/command'
import { MinecraftRun } from './mc-run'
import { Minecraft } from './minecraft'
import { Ping } from './ping'

const MISC_COMMANDS: typeof BaseCommand[] = [
    Ping,
    Minecraft,
    MinecraftRun
]

export const COMMANDS: typeof BaseCommand[] = [
    ...MISC_COMMANDS
]
