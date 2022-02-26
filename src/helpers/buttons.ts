import { Button } from "aws-sdk/clients/lexruntime"
import { GAME_SERVER_ID } from "../constants/game-servers"

export enum ButtonActions {
    start = 'start',
    stop = 'stop'
}

const GAME_SERVER_BUTTON_PREFIX = 'game-server'

export type BasicButtonId = string
export type GameServerButtonId = BasicButtonId

export interface BasicButton {
    prefix: string
    action: ButtonActions
    uniqueId: string
}

export interface GameServerButton {
    prefix: string,
    action: ButtonActions,
    gameServerId: GAME_SERVER_ID,
}

export const getButtonId = (prefix: string, action: string, uniqueId: string): BasicButtonId => `${prefix}/${action}/${uniqueId}`

export const getGameServerButtonId = (action: ButtonActions, gameServer: GAME_SERVER_ID): GameServerButtonId => getButtonId(GAME_SERVER_BUTTON_PREFIX, action, gameServer)

export const parseGameServerButton = (id: GameServerButtonId): GameServerButton => {
    const { prefix, action, uniqueId } = parseButtonId(id)

    return {
        prefix,
        action,
        gameServerId: uniqueId as GAME_SERVER_ID
    }
}

export const isGameServerButton = (id: string): id is GameServerButtonId => id.split('/')[0] === GAME_SERVER_BUTTON_PREFIX

export const parseButtonId = (id: string): BasicButton => {
    const [prefix, action, uniqueId] = id.split('/')

    return {
        prefix,
        action: action as ButtonActions,
        uniqueId
    }
}
