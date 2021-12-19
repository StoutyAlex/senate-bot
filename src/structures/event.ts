import { Executeable } from "../types"
import { SenateBot } from "./senate-bot"

export class BaseEvent extends Executeable {
    public client: SenateBot

    public async execute(...args: any): Promise<any> {}
}
