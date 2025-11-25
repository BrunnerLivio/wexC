export { AxisController };

/**
 * @typedef {"roll-left" | "roll-right" | "pitch-forward" | "pitch-back" | "yaw-left" | "yaw-right" | null} AxisRotation
 */

/**
 * @typedef AxisDependencies
 * @property {() => void} toppleRollLeft
 * @property {() => void} toppleRollRight
 * @property {() => void} topplePitchForward
 * @property {() => void} topplePitchBack
 * @property {() => void} rotateYawLeft
 * @property {() => void} rotateYawRight
 * @property {{
 *   areWeInCharge: () => boolean,
 *   takeCharge: () => void,
 *   onActivePlayerIdChanged: (callback: Function) => void,
 * }} playerController
 */

/**
 * @typedef {{
 *   container: HTMLElement,
 * }} AxisSetupPayload
 */

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
    playerController,
  } = dependencies;

  /** @type {Array<(payload: AxisSetupPayload) => void>} */
  const setupCallbacks = [];
  /** @type {Array<(axis: AxisRotation) => void>} */
  const axisObservers = [];

  /** @type {HTMLElement | null} */
  let containerElement = null;
  /** @type {AxisRotation} */
  let currentAxis = null;

  const axisHandlers = {
    "roll-left": toppleRollLeft,
    "roll-right": toppleRollRight,
    "pitch-forward": topplePitchForward,
    "pitch-back": topplePitchBack,
    "yaw-left": rotateYawLeft,
    "yaw-right": rotateYawRight,
  };

  const ensureInCharge = () => {
    if (!playerController) return true;
    if (playerController.areWeInCharge()) {
      return true;
    }
    playerController.takeCharge();
    return playerController.areWeInCharge();
  };

  /**
   * @param {AxisRotation} axis
   */
  const notifyAxisObservers = (axis) => {
    axisObservers.forEach((observer) => observer(axis));
  };

  /**
   * @param {AxisRotation} axis
   */
  const setAxis = (axis) => {
    if (currentAxis === axis) return;
    currentAxis = axis;
    notifyAxisObservers(axis);
  };

  /**
   * @param {AxisRotation} axis
   */
  const triggerRotation = (axis) => {
    if (!axis) return;
    if (!ensureInCharge()) return;
    const action = axisHandlers[axis];
    action?.();
    setAxis(axis);
    // Reset after a short delay for visual feedback
    setTimeout(() => setAxis(null), 300);
  };

  /**
   * @param {(payload: AxisSetupPayload) => void} callback
   */
  const onSetupFinished = (callback) => {
    if (containerElement) {
      callback({ container: containerElement });
      return;
    }
    setupCallbacks.push(callback);
  };

  /**
   * @param {(axis: AxisRotation) => void} observer
   */
  const onAxisChanged = (observer) => {
    axisObservers.push(observer);
  };

  /**
   * @param {HTMLElement} container
   */
  const notifySetupFinished = (container) => {
    if (!(container instanceof HTMLElement)) return;
    containerElement = container;
    const payload = { container };
    while (setupCallbacks.length > 0) {
      const callback = setupCallbacks.shift();
      callback && callback(payload);
    }
  };

  const setupPlayerStateSync = (container) => {
    if (!playerController) return;
    const update = () => {
      container.dataset.inCharge = playerController.areWeInCharge()
        ? "self"
        : "other";
    };
    playerController.onActivePlayerIdChanged(update);
    update();
  };

  onSetupFinished(({ container }) => {
    setupPlayerStateSync(container);
  });

  return {
    onSetupFinished,
    notifySetupFinished,
    onAxisChanged,
    triggerRotation,
  };
};
