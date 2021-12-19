import { BotConfig } from "./config-helper";

export const getToken = async (): Promise<string> => {
    return process.env.DISCORD_TOKEN!
}
