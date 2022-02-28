import { BaseCommand } from '../../structures/command'
import { FTB } from './game-servers/ftb'
import { FTBRun } from './game-servers/ftb-run'
import { MinecraftRun } from './game-servers/mc-run'
import { Minecraft } from './game-servers/minecraft'
import { Ping } from './ping'
import { Tribunal } from './tribunal'
import { Valheim } from './game-servers/valheim'
import { Walls } from './game-servers/walls'
import { WallsRun } from './game-servers/walls-run'

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
