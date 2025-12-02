/**
 * @module tetris/control/RadialModel
 */

export { RadialModel }

/**
 * @typedef RadialModelType
 * @property { String } axisName - Name of the axis (e.g., "X", "Y", "Z")
 * @property { Number } radius - Radius of the ring in pixels
 * @property { Number } initialValue - Initial value for the axis
 * @property { String } color - Color of the ring
 */

/**
 * @param { RadialModelType } paramObj - Parameter Object Pattern
 * @return {RadialModelType}
 */
const RadialModel = (paramObj) => paramObj
