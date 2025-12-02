export { SwitchModeController };

/**
 * @typedef {"tetronimo" | "room"} ControllerMode
 */

/** @type {Array<ControllerMode>} */
const modes = ['tetronimo', 'room'];

/**
 * @param {import("../../kolibri/observable/observableMap").ObservableMapType} om
 */
const SwitchModeController = (om) => {
    let currentMode = modes[0];

    const changeMode = (value) => {
        if (value) {
            currentMode = modes[1];
        } else {
            currentMode = modes[0];
        }

        console.log('new mode', currentMode);
    };

    /**
     * @param {HTMLElement} container
     */
    const notifySetupFinished = (container) => {
        const input = container.querySelector('input');

        // Listen to the checkbox state change
        input.addEventListener('change', () => {
            const isChecked = input.checked; // true / false
            changeMode(isChecked);
        });
    };

    /** @returns {ControllerMode} */
    const getCurrentMode = () => {
        return currentMode;
    };

    return { notifySetupFinished, getCurrentMode };
};
