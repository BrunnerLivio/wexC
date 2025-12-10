export { AxisController }

/**
 * @typedef {"roll" | "pitch" | "yaw"} AxisType
 */

/**
 * @typedef AxisDependencies
 * @property {() => void} toppleRollLeft
 * @property {() => void} toppleRollRight
 * @property {() => void} topplePitchForward
 * @property {() => void} topplePitchBack
 * @property {() => void} rotateYawLeft
 * @property {() => void} rotateYawRight
 * @property {(angle: number) => void} rotateRoomX
 * @property {(angle: number) => void} rotateRoomY
 * @property {(angle: number) => void} rotateRoomZ
 * @property {{
 *   areWeInCharge: () => boolean,
 *   takeCharge: () => void,
 *   onActivePlayerIdChanged: (callback: Function) => void,
 * }} playerController
 * @property {{
 *   getCurrentMode: () => ("tetromino" | "room"),
 *   onModeChanged: (callback: Function) => void,
 * }} switchModeController
 */

/**
 * @typedef {{
 *   container: HTMLElement,
 * }} AxisSetupPayload
 */

/**
 * @typedef {{
 *   axis: AxisType,
 *   angle: number,
 * }} AxisState
 */

const ROTATION_THRESHOLD = 20 // degrees needed to trigger one rotation

/**
 * @param { import("../../kolibri/observable/observableMap").ObservableMapType } om
 * @param {AxisDependencies} dependencies
 */
const AxisController = (om, dependencies) => {
    const {
        toppleRollLeft,
        toppleRollRight,
        topplePitchForward,
        topplePitchBack,
        rotateYawLeft,
        rotateYawRight,
        rotateRoomX,
        rotateRoomY,
        rotateRoomZ,
        playerController,
        switchModeController,
    } = dependencies
    /** @type {Array<(payload: AxisSetupPayload) => void>} */
    const setupCallbacks = []
    /** @type {Array<(state: AxisState) => void>} */
    const axisStateObservers = []

    /** @type {HTMLElement | null} */
    let containerElement = null

    // Track rotation offset for each axis (in degrees)
    const axisAngles = {
        roll: 0,
        pitch: 0,
        yaw: 0,
    }

    // Track last angle for calculating delta in room mode
    const lastRoomAngles = {
        roll: 0,
        pitch: 0,
        yaw: 0,
    }

    // Track how many rotations have been applied for each axis
    const appliedRotations = {
        roll: 0,
        pitch: 0,
        yaw: 0,
    }

    const axisHandlers = {
        roll: { left: toppleRollLeft, right: toppleRollRight },
        pitch: { left: topplePitchForward, right: topplePitchBack },
        yaw: { left: rotateYawLeft, right: rotateYawRight },
    }

    const ensureInCharge = () => {
        if (!playerController) return true
        if (playerController.areWeInCharge()) {
            return true
        }
        playerController.takeCharge()
        return playerController.areWeInCharge()
    }

    const playClickSound = () => {
        console.log('play click sound')
        const audio = new Audio('/sounds/click.wav')
        audio.volume = 0.5 // ensure click sounds are audible when music plays
        audio.play()
    }

    /**
     * @param {AxisState} state
     */
    const notifyAxisStateObservers = (state) => {
        axisStateObservers.forEach((observer) => observer(state))
    }

    /**
     * Set the rotation angle for an axis and trigger rotations when threshold is crossed
     * @param {AxisType} axis
     * @param {number} angle - rotation angle in degrees
     */
    const setAxisAngle = (axis, angle) => {
        if (!ensureInCharge()) return

        axisAngles[axis] = angle
        notifyAxisStateObservers({ axis, angle })

        const currentMode = switchModeController?.getCurrentMode()

        if (currentMode === 'room') {
            const delta = angle - lastRoomAngles[axis]
            lastRoomAngles[axis] = angle

            if (axis === 'roll') {
                rotateRoomZ(delta) // Roll rotates around Z axis (barrel roll)
            } else if (axis === 'pitch') {
                rotateRoomX(-1 * delta) // Pitch rotates around X axis (nose up/down)
            } else if (axis === 'yaw') {
                rotateRoomY(delta) // Yaw rotates around Y axis (turn left/right)
            }
        } else {
            const absAngle = Math.abs(angle)
            const direction = angle >= 0 ? 1 : -1
            const targetRotations =
                Math.floor(absAngle / ROTATION_THRESHOLD) * direction
            const currentRotations = appliedRotations[axis]

            if (targetRotations !== currentRotations) {
                const diff = targetRotations - currentRotations
                playClickSound()
                const handlers = axisHandlers[axis]

                const handler = diff > 0 ? handlers.right : handlers.left
                const count = Math.abs(diff)

                for (let i = 0; i < count; i++) {
                    handler()
                }

                appliedRotations[axis] = targetRotations
            }
        }
    }

    /**
     * Reset an axis to zero
     * @param {AxisType} axis
     */
    const resetAxis = (axis) => {
        axisAngles[axis] = 0
        appliedRotations[axis] = 0
        lastRoomAngles[axis] = 0
        notifyAxisStateObservers({ axis, angle: 0 })
    }

    /**
     * @param {(payload: AxisSetupPayload) => void} callback
     */
    const onSetupFinished = (callback) => {
        if (containerElement) {
            callback({ container: containerElement })
            return
        }
        setupCallbacks.push(callback)
    }

    /**
     * @param {(state: AxisState) => void} observer
     */
    const onAxisStateChanged = (observer) => {
        axisStateObservers.push(observer)
    }

    /**
     * @param {HTMLElement} container
     */
    const notifySetupFinished = (container) => {
        if (!(container instanceof HTMLElement)) return
        containerElement = container
        const payload = { container }
        while (setupCallbacks.length > 0) {
            const callback = setupCallbacks.shift()
            callback && callback(payload)
        }
    }

    const setupPlayerStateSync = (container) => {
        if (!playerController) return
        const update = () => {
            container.dataset.inCharge = playerController.areWeInCharge()
                ? 'self'
                : 'other'
        }
        playerController.onActivePlayerIdChanged(update)
        update()
    }

    onSetupFinished(({ container }) => {
        setupPlayerStateSync(container)
    })

    return {
        onSetupFinished,
        notifySetupFinished,
        onAxisStateChanged,
        setAxisAngle,
        resetAxis,
    }
}
