import { Observable } from "../../kolibri/observable/observable.js"

const MusicState = {
    PLAYING: 'playing',
    MUTED: 'muted',
}
const preferesMuted = localStorage.getItem('music-preference') === 'muted'

export { MusicController }

/**
 * @typedef MusicControllerType
 * @property { (fun: () => void) => void } onMute - register a callback to be called when music is muted
 * @property { (fun: () => void) => void } onPlay - register a callback to be called when music is played
 * @property { () => void } toggle - toggle between mute and play
 * @property { () => void } init - initialize the music controller, reading preferences from localStorage
 */

/**
 * @returns {MusicControllerType}
 */
const MusicController = () => {
    const musicState = Observable(null)

    musicState.onChange((state) => {
        localStorage.setItem(
            'music-preference',
            state === MusicState.MUTED ? 'muted' : 'playing'
        )
    })

    const init = () => {
        musicState.setValue(
            preferesMuted ? MusicState.MUTED : MusicState.PLAYING
        )
    }

    return {
        toggle: () => {
            const currentState = musicState.getValue()
            if (currentState === MusicState.MUTED) {
                musicState.setValue(MusicState.PLAYING)
            } else {
                musicState.setValue(MusicState.MUTED)
            }
        },
        onMute: (fun) =>
            musicState.onChange((state) =>
                state === MusicState.MUTED ? fun() : null
            ),
        onPlay: (fun) =>
            musicState.onChange((state) =>
                state === MusicState.PLAYING ? fun() : null
            ),
        init,
    }
}
