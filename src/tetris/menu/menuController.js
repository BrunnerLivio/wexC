import { Observable } from '../../kolibri/observable/observable.js'

export { MenuController }

/**
 * @typedef MenuControllerType
 * @property { (fun: () => void) => void } onOpen - register a callback to be called when menu is opened
 * @property { (fun: () => void) => void } onClose - register a callback to be called when menu is closed
 * @property { () => void } open - open the modal
 * @property { () => void } close - close the modal
 */

/**
 * @returns {MenuControllerType}
 */
const MenuController = () => {
    const menuIsOpenState = Observable(null)

    return {
        open: () => menuIsOpenState.setValue(true),
        close: () => menuIsOpenState.setValue(false),
        onOpen: (fun) =>
            menuIsOpenState.onChange((isOpen) =>
                isOpen === true ? fun() : null
            ),
        onClose: (fun) =>
            menuIsOpenState.onChange((isOpen) =>
                isOpen === false ? fun() : null
            ),
    }
}
