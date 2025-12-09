import { dom } from '../../kolibri/util/dom.js'
import { LoggerFactory } from '../../kolibri/logger/loggerFactory.js'

export { projectGameState }

const log = LoggerFactory('ch.fhnw.tetris.gameState.gameStateProjector')

/**
 * @param { import('./gameStateController.js').GameStateControllerType } gameStateController
 * @return { HTMLCollection }
 */
const projectGameState = (gameStateController) => {
    const view = dom(`
        <div>score: <span class="score">0</span></div>
    `)
    const scoreDiv = view[0]

    // data binding

    gameStateController.onGameStateChanged(
        /** @type { import('./gameStateModel.js').GameStateModelType } */ (
            gameState
        ) => {
            scoreDiv.children[0].textContent = gameState.score
        }
    )

    return view
}
