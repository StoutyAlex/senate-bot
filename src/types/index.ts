import { ClientEvents, Message } from "discord.js";
import { BaseEvent } from "../structures/event";
import { SenateBot } from "../structures/senate-bot";

export enum Stage {
    DEV = 'dev',
    PROD = 'prod',
    LOCAL = 'local',
}

export interface CommandMeta {
    name: string
    aliases: readonly string[]
}

export type Events = {[property in keyof Partial<ClientEvents>]: typeof BaseEvent}


export abstract class Executeable {
    constructor(public client: SenateBot) {
        this.client = client
    }

    abstract execute(...args: any): Promise<any>
}

export abstract class AbstractCommand extends Executeable {
    abstract meta: CommandMeta

    abstract execute(message: Message, args: string[]): Promise<any>
}