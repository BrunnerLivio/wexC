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
        <div class="score-container">score: <span class="score">0</span></div>
    `)
    const scoreDiv = view[0]

    // data binding

    gameStateController.onGameStateChanged(
        /** @type { import('./gameStateModel.js').GameStateModelType } */ (
            gameState
        ) => {
            const padded = String(gameState.score).padStart(3, '0')
            scoreDiv.children[0].textContent = padded
        }
    )

    return view
}
