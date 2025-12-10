import { Observable } from '../../kolibri/observable.js'
import { RecklessObservable } from '../../kolibri/observable/recklessObservable.js'
import { clamp } from '../util/util.js'

export { FastDownController }

const REPEAT_DELAY = 270

const FastDownController = () => {
    const currentDirection = RecklessObservable(null) // value: true while pressed, null when released
    let repeatHandle = null
    let activePointerId = null

    const stopRepeating = () => {
        if (repeatHandle !== null) {
            window.clearInterval(repeatHandle)
            repeatHandle = null
        }
    }

    const startRepeating = () => {
        // immediate emit
        currentDirection.setValue(true)

        // repeated emits
        stopRepeating()
        repeatHandle = window.setInterval(() => {
            currentDirection.setValue(true)
        }, REPEAT_DELAY)
    }

    const stop = () => {
        stopRepeating()
        activePointerId = null
        currentDirection.setValue(null) // notify release
    }

    /**
     * Attach pointer handlers to an element
     * The controller will call currentDirection.setValue(true) while pressed.
     * @param {HTMLElement} el
     */
    const registerPointerHandlers = (el) => {
        if (!el) return

        const onPointerDown = (ev) => {
            const pe = /** @type {PointerEvent} */ (ev)
            // ignore if another pointer already active (simple protection)
            if (activePointerId !== null) return

            pe.preventDefault()
            activePointerId = pe.pointerId
            startRepeating()

            // attach document-level end handler
            const onUp = (upEv) => {
                const upe = /** @type {PointerEvent} */ (upEv)
                // require same pointerId for safety
                if (upe.pointerId !== activePointerId) return
                stop()
                document.removeEventListener('pointerup', onUp)
                document.removeEventListener('pointercancel', onUp)
            }

            document.addEventListener('pointerup', onUp)
            document.addEventListener('pointercancel', onUp)
        }

        el.addEventListener('pointerdown', onPointerDown, { passive: false })
    }

    return {
        registerPointerHandlers,
        onDirectionChanged: currentDirection.onChange,
    }
}
