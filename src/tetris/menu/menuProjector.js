import { dom, select } from '../../kolibri/util/dom.js'
import { projectPlayerList } from '../player/playerProjector.js'

export { projectMenu }

/**
 * @param {import('../game/gameController.js').GameControllerType } gameController
 * @return { HTMLCollection }
 */
const projectMenu = (gameController) => {
    const view = dom(`
        <!-- Modal Trigger -->
        <div>
            <button id="openModalBtn" class="modal-button">☰</button>
        </div>

        <!-- Modal -->
        <div
            id="modal"
            class="modal"
            role="dialog"
            aria-modal="true"
            aria-hidden="true"
        >
            <div class="modal-content">
                <div class="modal-left">
                    <h2>Welcome!</h2>
                    <p>If you're on desktop, use mouse or touch to rotate the coords. Use arrow keys to move the tetromino and Shift + arrow keys to rotate.</p>
                    <p>If you're on mobile, please rotate your phone into landscape mode!</p>
                    <button id="closeModalBtn" class="modal-button">Close</button>
                </div>
                <div class="modal-right"></div>
            </div>
        </div>`)

    const button = view[0]
    const [openButton] = select(button, '#openModalBtn')
    const modal = view[1]
    const [closeButton] = select(modal, '#closeModalBtn')

    // Menu Control
    const menuController = gameController.menuController

    menuController.onOpen(() => openModal())
    menuController.onClose(() => closeModal())

    openButton.onclick = () => menuController.open()
    closeButton.onclick = () => menuController.close()

    // click outside closes it (optional)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal()
    })

    // escape key closes it
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal()
    })

    // handle player management display in modal
    const [playerManagement] = select(modal, '.modal-right')
    playerManagement.append(...projectControlPanel(gameController))

    const playerController = gameController.playerController
    playerController.onActivePlayerIdChanged((_) => {
        if (playerController.areWeInCharge()) {
            playerManagement.classList.add('active')
        } else {
            playerManagement.classList.remove('active')
        }
    })

    // initialize by rendering the modal
    openModal()

    return view

    function openModal() {
        modal.classList.add('show')
        modal.setAttribute('aria-hidden', 'false')
        document.body.style.overflow = 'hidden' // prevent background scrolling
    }

    function closeModal() {
        modal.classList.remove('show')
        modal.setAttribute('aria-hidden', 'true')
        document.body.style.overflow = '' // restore scroll
    }
}

/**
 * Create the control panel view and bind to the controller actions
 * @param { import('../game/gameController.js').GameControllerType } gameController
 * @return { HTMLElement[] }
 */
const projectControlPanel = (gameController) => {
    const view = dom(`
    <div>
        <h2>Player Info</h2>
        <div class="self"><input size=10></div>
    </div>`)

    const [header] = view

    const playerController = gameController.playerController
    header.append(...projectPlayerList(playerController))

    const [selfInput] = select(header, 'div.self input')

    // data binding

    playerController.onActivePlayerIdChanged((_) => {
        if (playerController.areWeInCharge()) {
            header.classList.add('active')
        } else {
            header.classList.remove('active')
        }
    })

    const updatePlayerNameInput = (player) => {
        if (playerController.thisIsUs(player)) {
            selfInput.value = player.name
        }
    }
    playerController.onPlayerAdded(updatePlayerNameInput)
    playerController.onPlayerChanged(updatePlayerNameInput)

    selfInput.oninput = (_event) => {
        playerController.setOwnName(selfInput.value)
    }

    return view
}
