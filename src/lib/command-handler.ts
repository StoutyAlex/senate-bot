import { Message } from "discord.js";
import { SenateBot } from "../structures/senate-bot";

const commandHandler = (client: SenateBot, message: Message) => {
    const args = message.content.substring(client.config.prefix.length).trim().split(/ +/)
    const cmd = args.shift()!.toLowerCase();

    const command = client.commands.find(com => com.meta!.name === cmd || com.meta!.aliases.includes(cmd!));

    if (command) {
        command.execute(message, args);
    }
};

export { commandHandler }
