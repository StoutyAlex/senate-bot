import 'dotenv/config'
import { getBotConfig } from './lib/configuration/config-helper'
import { secrets } from './lib/configuration';
import { SenateBot } from './structures/senate-bot';

import { COMMANDS } from './lib/commands';
import { EVENTS } from './lib/events';

const config = getBotConfig();

const client = new SenateBot({ config, commands: COMMANDS, events: EVENTS });

export const run = async () => {
    const token = await secrets.getToken(config)
    await client.start(token)
}

run()
