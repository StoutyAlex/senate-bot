import { BaseCommand } from '../../structures/command'
import { FTB } from './ftb'
import { FTBRun } from './ftb-run'
import { MinecraftRun } from './mc-run'
import { Minecraft } from './minecraft'
import { Ping } from './ping'
import { Tribunal } from './tribunal'
import { Valheim } from './valheim'
import { Walls } from './walls'
import { WallsRun } from './walls-run'

const MISC_COMMANDS: typeof BaseCommand[] = [
    Ping,
    Minecraft,
    MinecraftRun,
    FTB,
    FTBRun,
    WallsRun,
    Walls,
    Tribunal,
    Valheim
]

export const COMMANDS: typeof BaseCommand[] = [
    ...MISC_COMMANDS
]
