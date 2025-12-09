import { dom, select } from '../../kolibri/util/dom.js'

export { projectMenu }

/**
 * @param {import('../game/gameController.js').GameControllerType } gameController
 * @return { HTMLCollection }
 */
const projectMenu = (gameController) => {
    const view = dom(`
        <!-- Modal Trigger -->
        <div>
            <button id="openModalBtn" class="modal-button">👥</button>
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
                <h2>Welcome!</h2>
                <p>If you're on desktop, use mouse or touch to rotate the coords. Use arrow keys to move the tetromino and Shift + arrow keys to rotate.</p>
                <p>If you're on mobile, please rotate your phone into landscape mode!</p>
                <div class="player-mngmt"></div>
                <button id="closeModalBtn" class="modal-button">Close</button>
            </div>
        </div>`)

    const button = view[0]
    const [openButton] = select(button, '#openModalBtn')
    const modal = view[1]
    const [closeButton] = select(modal, '#closeModalBtn')

    console.log(button, openButton, modal, closeButton)

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

    // Audio control functionality
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

    // initialize by rendering the modal
    openModal()

    return view
}
