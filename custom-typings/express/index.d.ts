import { SenateBot } from "../../src/structures/senate-bot"

declare global {
    module Express {
        export interface Request {
            client: SenateBot
        }
    }
}
