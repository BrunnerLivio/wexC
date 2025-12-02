export { SwitchModeController }

/**
 * @typedef {"tetromino" | "room"} ControllerMode
 */

/** @type {Array<ControllerMode>} */
const modes = ['tetromino', 'room']

/**
 * @param {import("../../kolibri/observable/observableMap").ObservableMapType} om
 */
const SwitchModeController = (om) => {
    let currentMode = modes[0]

    /** @type {Array<(mode: ControllerMode) => void>} */
    const modeObservers = []

    const changeMode = (value) => {
        if (value) {
            currentMode = modes[1]
            document.body.classList.toggle('mode-room')
        } else {
            currentMode = modes[0]
        }

        console.log('new mode', currentMode)
        modeObservers.forEach((observer) => observer(currentMode))
    }

    /**
     * @param {HTMLElement} container
     */
    const notifySetupFinished = (container) => {
        const input = container.querySelector('input')

        // Listen to the checkbox state change
        input.addEventListener('change', () => {
            const isChecked = input.checked // true / false
            changeMode(isChecked)
        })
    }

    /** @returns {ControllerMode} */
    const getCurrentMode = () => {
        return currentMode
    }

    /**
     * @param {(mode: ControllerMode) => void} observer
     */
    const onModeChanged = (observer) => {
        modeObservers.push(observer)
    }

    return { notifySetupFinished, getCurrentMode, onModeChanged }
}
