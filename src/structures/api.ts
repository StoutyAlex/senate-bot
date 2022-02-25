import express, { Express } from 'express'
import bodyParser from 'body-parser'
import { SenateBot } from './senate-bot'

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
