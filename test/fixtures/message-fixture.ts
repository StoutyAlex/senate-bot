import { Message } from 'discord.js'
import faker from 'faker'
import { BaseCommand } from '../../src/structures/command'

interface fixtureOverrides {
    content: string
    author: {
        bot: boolean
    }
}

export const fixtureMessage = (overrides?: Partial<fixtureOverrides>) => ({
    content: faker.random.words(2),
    channel: {
        send: jest.fn()
    },
    author: {
        bot: false
    },
    ...overrides
} as unknown as Message)

export const fixtureCommandMessage = (command: BaseCommand, args?: string[], overrides?: Partial<fixtureOverrides>) => ({
    ...fixtureMessage(),
    ...overrides,
    content: `${command.meta.name} ${args ? args.join(' ') : ''}`.trim()
} as unknown as Message)

