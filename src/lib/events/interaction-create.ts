import { ClientEvents } from 'discord.js'
import { GAME_SERVERS } from '../../constants/game-servers'
import { isGameServerButton, ButtonActions, parseGameServerButton } from '../../helpers/buttons'
import { BaseEvent } from '../../structures/event'
import { GameServerCommand } from '../commands/game-server'

export class InteractionCreate extends BaseEvent {
    public static readonly eventName = 'interactionCreate'

    public async execute([ interaction ]: ClientEvents['interactionCreate']) {
        if (interaction.isButton()) {
            console.log('Interaction button', interaction.customId)

            if (isGameServerButton(interaction.customId)) {
                const { gameServerId, action, prefix } = parseGameServerButton(interaction.customId)
                const gameServer = GAME_SERVERS.find(gs => gs.id === gameServerId)

                if (!gameServer) {
                    throw new Error(`Unable to find game-server with ID: ${ gameServerId }`)
                }

                action === ButtonActions.start ? await GameServerCommand.startServer(gameServer) : await GameServerCommand.stopServer(gameServer)
            }

            interaction.update({ })
        }
    }
}
 