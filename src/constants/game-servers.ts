import { HexColorString } from "discord.js";
import { GameServerStatusUpdate } from "../structures/api";
import { INSTANCE_NAME } from "./instance-names";
import { MESSAGE_PURPOSE } from "./message-purposes";

export enum GAME_SERVER_ID {
    MINECRAFT = 'minecraft-vanilla',
    MINECRAFT_FTB = 'minecraft-ftb',
    MINECRAFT_WALLS = 'minecraft-walls',
    VALHEIM = 'valheim'
}

export const STATE_COLORS: { [key in GameServerStatusUpdate['state']]: HexColorString } = {
    pending: '#EEEE33',
    running: '#33EE33',
    stopped: '#FF3333',
    stopping: '#FF4500',
 }

export interface GameServer {
    title: string
    id: GAME_SERVER_ID
    alias: string
    purpose: MESSAGE_PURPOSE,
    instanceName: INSTANCE_NAME,
    startStopLambda: string
    version?: string
}

export const GAME_SERVERS: GameServer[] = [
    {
        title: 'Minecraft Vanilla',
        id: GAME_SERVER_ID.MINECRAFT,
        alias: 'minecraft',
        purpose: MESSAGE_PURPOSE.GAMESERVER_MINECRAFT,
        instanceName: INSTANCE_NAME.MINECRAFT_VANILLA,
        version: '1.18.1',
        startStopLambda: process.env.START_STOP_MC_LAMBDA_NAME!
    },
    {
        title: 'Minecraft: Feed The Beast',
        id: GAME_SERVER_ID.MINECRAFT_FTB,
        alias: 'ftb',
        purpose: MESSAGE_PURPOSE.GAMESERVER_MINECRAFT_FTB,
        instanceName: INSTANCE_NAME.MINECRAFT_FTB,
        version: 'FTB Ultimate: Anniversary Edition. v1.2.0',
        startStopLambda: process.env.START_STOP_FTB_LAMBDA_NAME!
    },
    {
        title: 'Minecraft: The Walls PvP',
        id: GAME_SERVER_ID.MINECRAFT_WALLS,
        alias: 'walls',
        version: '1.18.1',
        purpose: MESSAGE_PURPOSE.GAMESERVER_MINECRAFT_WALLS,
        instanceName: INSTANCE_NAME.MINECRAFT_WALLS,
        startStopLambda: process.env.START_STOP_WALLS_LAMBDA_NAME!
    },
    {
        title: 'Valheim',
        id: GAME_SERVER_ID.VALHEIM,
        alias: 'valheim',
        purpose: MESSAGE_PURPOSE.GAMESERVER_VALHEIM,
        instanceName: INSTANCE_NAME.VALHEIM,
        startStopLambda: process.env.START_STOP_VALHEIM_LAMBDA_NAME!
    },
]