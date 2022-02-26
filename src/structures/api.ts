import express, { Express } from 'express'
import bodyParser from 'body-parser'
import { SenateBot } from './senate-bot'
import { GAME_SERVER_ID } from '../constants/game-servers'
import { EC2StatusEvent } from '../minecraft/alert-server-status'

export interface GameServerStatusUpdate {
    ipAddress?: string
    state: EC2StatusEvent['detail']['state']
    gameServerId: GAME_SERVER_ID,
    reason?: string,
}

export class Api {
    private client: SenateBot
    public app: Express

    constructor(client: SenateBot) {
        this.client = client
        this.app = express()

        this.app.use(bodyParser.json())

        this.app.use((req, _, next) => {
            req.client = this.client
            next()
        })
    }

    listen(port: number | string) {
        this.app.listen(port, () => console.log('App listening on port', port))
    }
}
