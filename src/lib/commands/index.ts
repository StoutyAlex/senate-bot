import { BaseCommand } from '../../structures/command'
import { FTB } from './ftb'
import { FTBRun } from './ftb-run'
import { MinecraftRun } from './mc-run'
import { Minecraft } from './minecraft'
import { Ping } from './ping'
import { Tribunal } from './tribunal'

const MISC_COMMANDS: typeof BaseCommand[] = [
    Ping,
    Minecraft,
    MinecraftRun,
    FTB,
    FTBRun,
    Tribunal
]

export const COMMANDS: typeof BaseCommand[] = [
    ...MISC_COMMANDS
]
