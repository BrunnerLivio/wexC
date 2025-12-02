import { Observable } from "../../kolibri/observable.js";
import { RecklessObservable } from "../../kolibri/observable/recklessObservable.js";
import { clamp } from "../util/util.js";

export { JoystickPositionController };

/**
 * @typedef {"up" | "down" | "left" | "right" | null} JoystickDirection
 */

const REPEAT_DELAY = 180;

const JoystickPositionController = () => {
  /** @type {Observable<JoystickDirection>} */
  let currentDirection = RecklessObservable(null);
  /** @type {number | null} */
  let repeatHandle = null;
  /** @type {number | null} */
  let activePointerId = null;

  /** @type {Observable<{x: number, y: number}>} */
  let centerOffset = Observable({ x: 0, y: 0 });

  const stopRepeatingMove = () => {
    if (repeatHandle === null) return;

    window.clearInterval(repeatHandle);
    repeatHandle = null;
  };

  const resetCenterOffset = () => centerOffset.setValue({ x: 0, y: 0 });

  /**
   * @param {JoystickDirection} direction
   */
  const startRepeatingMove = (direction) => {
    if (!direction) return;

    stopRepeatingMove();
    repeatHandle = window.setInterval(() => {
      currentDirection.setValue(direction);
    }, REPEAT_DELAY);
  };

  /**
   * @param {JoystickDirection} direction
   */
  const setDirection = (direction) => {
    if (currentDirection.getValue() === direction) return;
    currentDirection.setValue(direction);
    stopRepeatingMove();
    if (direction) {
      startRepeatingMove(direction);
    }
  };

  const resetDirection = () => {
    setDirection(null);
    resetCenterOffset();
  };

  /**
   * @param {PointerEvent} event
   * @param {HTMLElement} pad
   * @returns {JoystickDirection}
   */
  const computeDirectionFromPointer = (event, pad) => {
    const rect = pad.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    const visualLimit = 24;
    const clampedX = clamp(x, visualLimit);
    const clampedY = clamp(y, visualLimit);
    centerOffset.setValue({ x: clampedX, y: clampedY });

    const deadZone = 12;
    if (Math.hypot(x, y) < deadZone) {
      return null;
    }
    if (Math.abs(x) > Math.abs(y)) {
      return x > 0 ? "right" : "left";
    }
    return y > 0 ? "down" : "up";
  };

  /**
   * @param {HTMLElement} pad
   */
  const registerPointerHandlers = (pad) => {
    const handlePointerMove = (event) => {
      const pointerEvent = /** @type {PointerEvent} */ (event);
      if (activePointerId !== pointerEvent.pointerId) {
        return;
      }
      pointerEvent.preventDefault();
      setDirection(computeDirectionFromPointer(pointerEvent, pad));
    };

    const handlePointerEnd = (event) => {
      const pointerEvent = /** @type {PointerEvent} */ (event);
      if (activePointerId !== pointerEvent.pointerId) {
        return;
      }
      activePointerId = null;
      resetDirection();
      
      // Remove document-level listeners
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerEnd);
      document.removeEventListener("pointercancel", handlePointerEnd);
    };

    pad.addEventListener("pointerdown", (event) => {
      const pointerEvent = /** @type {PointerEvent} */ (event);
      pointerEvent.preventDefault();
      pointerEvent.stopPropagation();
      activePointerId = pointerEvent.pointerId;
      setDirection(computeDirectionFromPointer(pointerEvent, pad));
      
      // Add document-level listeners for move and end
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerEnd);
      document.addEventListener("pointercancel", handlePointerEnd);
    });
  };

  return {
    registerPointerHandlers,
    resetCenterOffset,
    onCenterOffsetChanged: centerOffset.onChange,
    onDirectionChanged: currentDirection.onChange,
  };
};
