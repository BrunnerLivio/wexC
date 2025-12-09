import { dom, select } from '../../kolibri/util/dom.js'
import { LoggerFactory } from '../../kolibri/logger/loggerFactory.js'

export { projectGameState }

/**
 * @param { import('../game/gameController.js').GameControllerType } gameController
 * @return { HTMLCollection }
 */
const projectGameState = (gameController) => {
    const view = dom(`
        <div class="score-container">score: <span class="score">0</span></div>
    `)
    const scoreContainerDiv = view[0]
    const scoreText = select(scoreContainerDiv, '.score')

    // data binding

    const gameStateController = gameController.gameStateController
    gameStateController.onGameStateChanged(
        /** @type { import('./gameStateModel.js').GameStateModelType } */ (
            gameState
        ) => {
            const padded = String(gameState.score).padStart(3, '0')
            scoreText.textContent = padded
        }
    )

    const playerController = gameController.playerController
    playerController.onActivePlayerIdChanged((_) => {
        if (playerController.areWeInCharge()) {
            scoreContainerDiv.classList.add('active')
        } else {
            scoreContainerDiv.classList.remove('active')
        }
    })

    return view
}
