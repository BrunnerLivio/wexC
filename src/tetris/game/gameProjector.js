import { MISSING_FOREIGN_KEY } from '../../extension/relationalModelType.js'
import { LoggerFactory } from '../../kolibri/logger/loggerFactory.js'
import '../../kolibri/util/array.js'
import { dom, select } from '../../kolibri/util/dom.js'
import { projectGameState } from '../gameState/gameStateProjector.js'
import { projectPlayerList } from '../player/playerProjector.js'
import { registerForMouseAndTouch } from '../scene3D/scene.js'

export { projectGame }

const log = LoggerFactory('ch.fhnw.tetris.gameProjector')

/**
 * Create the control panel view and bind to the controller actions
 * @param { import("./gameController.js").GameControllerType } gameController
 * @return { HTMLElement[] }
 */
const projectControlPanel = (gameController) => {
    const view = dom(`
    <header>
        <div class="self"><input size=10></div>
    </header>`)

    const [header] = view

    const playerController = gameController.playerController
    header.append(...projectPlayerList(playerController))
    header.prepend(...dom('<div></div>'))
    header.prepend(...projectGameState(gameController.gameStateController))

    const [selfInput] = select(header, 'div.self input')

    // data binding

    playerController.onActivePlayerIdChanged((_) => {
        if (playerController.areWeInCharge()) {
            header.classList.add('active')
        } else {
            header.classList.remove('active')
        }
    })

    const updatePlayerNameInput = (player) => {
        if (playerController.thisIsUs(player)) {
            selfInput.value = player.name
        }
    }
    playerController.onPlayerAdded(updatePlayerNameInput)
    playerController.onPlayerChanged(updatePlayerNameInput)

    selfInput.oninput = (_event) => {
        playerController.setOwnName(selfInput.value)
    }

    return view
}

/**
 * Create the main view and bind to the main key bindings
 * @impure sets the main view
 * @param { import("./gameController.js").GameControllerType } gameController
 * @return { HTMLElement[] }
 */
const projectMain = (gameController) => {
    const boxFaceDivs = (6).times((_) => "<div class='face'></div>").join('')

    const mainElements = dom(`
        <main id="main" class="scene3d noSelection">
            <div class="coords" style="
                    --coords-rotate-x:  85;
                    --coords-rotate-y: -15;
                    top:                75cqh;
                    left:               45cqw;
            ">
                <div class="floor">
                    <div class="toplight"></div>
                </div>
                <div class="plane show xz-plane"></div>
                <div class="plane show yz-plane"></div>
                <div class="tetromino ghost" >
                    <div class="box">${boxFaceDivs}</div>   
                    <div class="box">${boxFaceDivs}</div>   
                    <div class="box">${boxFaceDivs}</div>   
                    <div class="box">${boxFaceDivs}</div>   
                </div>
                <!--    tetrominos to be added here -->
            </div>
        </main>
        `)

    // view binding
    const main = mainElements[0]
    const [coordsDiv] = select(main, '.coords')
    const [ghostDiv] = select(main, '.ghost')
    const [...ghostBoxesDivs] = select(ghostDiv, '.box')

    registerForMouseAndTouch(main) // the general handling of living in a 3D scene

    // Connect scene rotation to axis controller for room mode
    gameController.setRoomRotationCallbacks({
        rotateX: (deltaAngle) => {
            const currentX =
                parseFloat(
                    window
                        .getComputedStyle(coordsDiv)
                        .getPropertyValue('--coords-rotate-x')
                ) || 0
            coordsDiv.style.setProperty(
                '--coords-rotate-x',
                String(currentX - deltaAngle)
            )
        },
        rotateY: (deltaAngle) => {
            const currentY =
                parseFloat(
                    window
                        .getComputedStyle(coordsDiv)
                        .getPropertyValue('--coords-rotate-y')
                ) || 0
            coordsDiv.style.setProperty(
                '--coords-rotate-y',
                String(currentY + deltaAngle)
            )
        },
        rotateZ: (deltaAngle) => {
            const currentZ =
                parseFloat(
                    window
                        .getComputedStyle(coordsDiv)
                        .getPropertyValue('--coords-rotate-z')
                ) || 0
            coordsDiv.style.setProperty(
                '--coords-rotate-z',
                String(currentZ + deltaAngle)
            )
        },
    })

    gameController.tetrominoController.onCurrentTetrominoIdChanged(
        (tetroId) => {
            // show ghost only if we have a current tetro
            if (tetroId === MISSING_FOREIGN_KEY) {
                ghostDiv.classList.remove('show')
            } else {
                ghostDiv.classList.add('show')
            }
        }
    )

    const mayAddTetroDiv = (tetromino) => {
        if (!tetromino) return
        if (tetromino.id === MISSING_FOREIGN_KEY) return
        const mayTetroDiv = main.querySelector(
            `.tetromino[data-id="${tetromino.id}"]`
        )
        if (mayTetroDiv) {
            return mayTetroDiv
        }
        const [tetroDiv] = dom(
            `<div class="tetromino ${tetromino.shapeName}" data-id="${tetromino.id}"></div>`
        )
        coordsDiv.append(tetroDiv)
        return tetroDiv
    }
    gameController.tetrominoController.onTetrominoAdded((tetromino) => {
        mayAddTetroDiv(tetromino)
    })
    gameController.tetrominoController.onTetrominoRemoved((tetromino) => {
        const div = main.querySelector(`[data-id="${tetromino.id}"]`)
        if (!div) {
            log.warn(
                'cannot find view to remove tetromino ' +
                    JSON.stringify(tetromino)
            )
            return
        }
        setTimeout((_) => {
            div.remove()
        }, 2000) // todo take from config, must be aligned with CSS animations/transitions timing
    })

    const updateBoxDivPosition = (box, boxDiv) => {
        boxDiv.style = `--x:${box.xPos};--y:${box.yPos};--z:${box.zPos};`
        const boxIdx = box.id.slice(-1) // 0..3 // not so nice. better: a box can maintain its index
        if (
            gameController.tetrominoController.isCurrentTetrominoId(box.tetroId)
        ) {
            // when moving a current tetro box - also move the ghost
            const ghostBoxDiv = ghostBoxesDivs[Number(boxIdx)]
            ghostBoxDiv.style = `--x:${box.xPos};--y:${box.yPos};--z:0;` // always mark the floor. more sophistication should go into a controller
        }
    }

    const handleNewBoxDiv = (box, count) => {
        if (box.id === MISSING_FOREIGN_KEY) return
        if (count === undefined) count = 0
        if (count++ > 4) {
            log.error(`cannot add box ${box.id} after ${count} retries`)
            return
        } // max recursive count
        const tetroDiv = mayAddTetroDiv(
            gameController.tetrominoController.findTetrominoById(box.tetroId)
        )
        if (!tetroDiv) {
            // this is an indication of data inconsistency, and it might be better to do a full reload
            log.warn(
                'cannot add box view since its tetromino view cannot be found or built.' +
                    box.id
            )
            setTimeout((_) => {
                // try again after a while
                handleNewBoxDiv(box, count)
            }, count * 200)
            return
        }
        const [boxDiv] = dom(
            `<div class="box" data-id="${box.id}">${boxFaceDivs}</div>`
        )
        updateBoxDivPosition(box, boxDiv)
        tetroDiv.append(boxDiv)
    }
    gameController.boxController.onBoxAdded(handleNewBoxDiv)
    gameController.boxController.onBoxRemoved((box) => {
        const boxDiv = main.querySelector(`.box[data-id="${box.id}"]`)
        if (!boxDiv) {
            // difficult to say when this might happen, but better be defensive
            log.error('cannot find div to remove for box id ' + box.id)
            return
        }
        boxDiv.classList.add('destroy')
        setTimeout((_) => {
            // remove only after visualization is done
            boxDiv.remove()
        }, 1500) // todo take from config, make sure it aligns with css anim/transition timing
    })
    gameController.boxController.onBoxChanged((box) => {
        if (box.id === MISSING_FOREIGN_KEY) return
        const boxDiv = main.querySelector(`.box[data-id="${box.id}"]`)
        if (!boxDiv) {
            log.debug(
                'unknown div for box ' + box.id
                //" import("./gameController.js").. Likely, tetro has not been added, yet. Later updates will resolve this."
            )
            return
        }
        updateBoxDivPosition(box, boxDiv)
    })
    return mainElements
}

const projectAxisControl = (gameController) => {
    const view = dom(`
    <aside class="axis-control" data-in-charge="other">
      <div class="axis-frame">
        <svg class="axis-rings" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rollGradient" gradientTransform="rotate(-30 0.5 0.5)">
              <stop offset="0%" style="stop-color: var(--color-blue-500); stop-opacity: 1" />
              <stop offset="22%" style="stop-color: var(--color-blue-400); stop-opacity: 1" />
              <stop offset="50%" style="stop-color: var(--color-blue-300); stop-opacity: 1" />
              <stop offset="100%" style="stop-color: var(--color-blue-200); stop-opacity: 1" />
            </linearGradient>
            <linearGradient id="rollGradientRoom" gradientTransform="rotate(-30 0.5 0.5)">
              <stop offset="0%" style="stop-color: var(--color-purple-500); stop-opacity: 1" />
              <stop offset="22%" style="stop-color: var(--color-purple-400); stop-opacity: 1" />
              <stop offset="50%" style="stop-color: var(--color-purple-300); stop-opacity: 1" />
              <stop offset="100%" style="stop-color: var(--color-purple-200); stop-opacity: 1" />
            </linearGradient>
            <linearGradient id="pitchGradient" gradientTransform="rotate(-30 0.5 0.5)">
              <stop offset="0%" style="stop-color: var(--color-cyan-500); stop-opacity: 1" />
              <stop offset="22%" style="stop-color: var(--color-cyan-400); stop-opacity: 1" />
              <stop offset="50%" style="stop-color: var(--color-cyan-300); stop-opacity: 1" />
              <stop offset="100%" style="stop-color: var(--color-cyan-200); stop-opacity: 1" />
            </linearGradient>
            <linearGradient id="pitchGradientRoom" gradientTransform="rotate(-30 0.5 0.5)">
              <stop offset="0%" style="stop-color: var(--color-pink-500); stop-opacity: 1" />
              <stop offset="22%" style="stop-color: var(--color-pink-400); stop-opacity: 1" />
              <stop offset="50%" style="stop-color: var(--color-pink-300); stop-opacity: 1" />
              <stop offset="100%" style="stop-color: var(--color-pink-200); stop-opacity: 1" />
            </linearGradient>
            <linearGradient id="yawGradient" gradientTransform="rotate(-30 0.5 0.5)">
              <stop offset="0%" style="stop-color: var(--color-green-500); stop-opacity: 1" />
              <stop offset="22%" style="stop-color: var(--color-green-400); stop-opacity: 1" />
              <stop offset="50%" style="stop-color: var(--color-green-300); stop-opacity: 1" />
              <stop offset="100%" style="stop-color: var(--color-green-200); stop-opacity: 1" />
            </linearGradient>
            <linearGradient id="yawGradientRoom" gradientTransform="rotate(-30 0.5 0.5)">
              <stop offset="0%" style="stop-color: var(--color-red-500); stop-opacity: 1" />
              <stop offset="22%" style="stop-color: var(--color-red-400); stop-opacity: 1" />
              <stop offset="50%" style="stop-color: var(--color-red-300); stop-opacity: 1" />
              <stop offset="100%" style="stop-color: var(--color-red-200); stop-opacity: 1" />
            </linearGradient>
          </defs>
          <!-- Roll ring (outer) -->
          <g class="axis-ring" data-axis="roll">
            <circle class="ring-track ring-track-tetromino" cx="110" cy="110" r="110" stroke="url(#rollGradient)" />
            <circle class="ring-track ring-track-room" cx="110" cy="110" r="110" stroke="url(#rollGradientRoom)" />
            <!-- White neon center line -->
            <circle class="ring-neon-line" cx="110" cy="110" r="110" stroke="white" stroke-width="3" fill="none" opacity="0.8" />
            <!-- Invisible hit area for easier selection -->
            <circle class="ring-hit-area" cx="110" cy="110" r="110" stroke="transparent" stroke-width="20" fill="none" />
          </g>
          
          <!-- Pitch ring (middle) -->
          <g class="axis-ring" data-axis="pitch">
            <circle class="ring-track ring-track-tetromino" cx="110" cy="110" r="80" stroke="url(#pitchGradient)" />
            <circle class="ring-track ring-track-room" cx="110" cy="110" r="80" stroke="url(#pitchGradientRoom)" />
            <!-- White neon center line -->
            <circle class="ring-neon-line" cx="110" cy="110" r="80" stroke="white" stroke-width="3" fill="none" opacity="0.8" />
            <!-- Invisible hit area for easier selection -->
            <circle class="ring-hit-area" cx="110" cy="110" r="80" stroke="transparent" stroke-width="20" fill="none" />
          </g>
          
          <!-- Yaw ring (inner) -->
          <g class="axis-ring" data-axis="yaw">
            <circle class="ring-track ring-track-tetromino" cx="110" cy="110" r="50" stroke="url(#yawGradient)" />
            <circle class="ring-track ring-track-room" cx="110" cy="110" r="50" stroke="url(#yawGradientRoom)" />
            <!-- White neon center line -->
            <circle class="ring-neon-line" cx="110" cy="110" r="50" stroke="white" stroke-width="3" fill="none" opacity="0.8" />
            <!-- Invisible hit area for easier selection -->
            <circle class="ring-hit-area" cx="110" cy="110" r="50" stroke="transparent" stroke-width="20" fill="none" />
          </g>
        </svg>
      </div>
    </aside>`)

    const elements = Array.from(view)
    const [container] = /** @type {HTMLElement[]} */ (elements)
    const svg = /** @type {SVGElement} */ (
        container.querySelector('.axis-rings')
    )
    const rings = container.querySelectorAll('.axis-ring')

    /**
     * Calculate angle from pointer position relative to SVG center
     * @param {PointerEvent} event
     * @param {SVGElement} svg
     * @returns {number} angle in degrees (0-360)
     */
    const calculateAngle = (event, svg) => {
        const rect = svg.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const dx = event.clientX - centerX
        const dy = event.clientY - centerY
        let angle = Math.atan2(dy, dx) * (180 / Math.PI)
        // Convert from standard math angle to our coordinate system (0° at top)
        angle = angle + 90
        return normalizeAngle(angle)
    }

    /**
     * Normalize angle to 0-360 range
     * @param {number} angle
     * @returns {number}
     */
    const normalizeAngle = (angle) => {
        angle = angle % 360
        if (angle < 0) angle += 360
        return angle
    }

    /**
     * Update the visual rotation of a ring
     * @param {Element} ring
     * @param {number} angle
     */
    const updateRingRotation = (ring, angle) => {
        ring.setAttribute('transform', `rotate(${angle} 110 110)`)
    }

    let dragState = null

    const handlePointerMove = /** @param {PointerEvent} event */ (event) => {
        if (!dragState) return

        event.preventDefault()
        const currentPointerAngle = calculateAngle(event, svg)

        let deltaAngle = currentPointerAngle - dragState.startAngle

        if (deltaAngle > 180) deltaAngle -= 360
        if (deltaAngle < -180) deltaAngle += 360

        dragState.currentAngle = deltaAngle

        updateRingRotation(dragState.ring, deltaAngle)

        gameController.axisController?.setAxisAngle(dragState.axis, deltaAngle)
    }

    const handlePointerEnd = () => {
        if (!dragState) return

        dragState.ring.classList.remove('dragging')

        updateRingRotation(dragState.ring, 0)

        gameController.axisController?.resetAxis(dragState.axis)

        document.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('pointerup', handlePointerEnd)
        document.removeEventListener('pointercancel', handlePointerEnd)

        dragState = null
    }

    rings.forEach((ring) => {
        const axis = ring.getAttribute('data-axis')

        if (!axis) return

        ring.addEventListener(
            'pointerdown',
            /** @param {PointerEvent} event */ (event) => {
                event.preventDefault()
                event.stopPropagation()

                ring.classList.add('dragging')
                dragState = {
                    axis,
                    ring,
                    startAngle: calculateAngle(event, svg),
                    currentAngle: 0,
                }

                document.addEventListener('pointermove', handlePointerMove)
                document.addEventListener('pointerup', handlePointerEnd)
                document.addEventListener('pointercancel', handlePointerEnd)
            }
        )
    })

    gameController.axisController?.notifySetupFinished(container)

    return view
}

const projectSwitchModeControl = (gameController) => {
    const view = dom(`
      <label class="switch" title="Switch mode" for="mode-switch">
        <input type="checkbox" id="mode-switch" aria-label="Switch mode">
        <span class="track"></span>

        <!-- moving round dot that shows only one SVG at a time -->
        <span class="dot">
          <!-- left icon (green) -->
          <svg class="icon icon-left"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 45 45"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true">
            <circle cx="22.5" cy="22.5" r="22.5" fill="#AFFF02"/>
            <g transform="matrix(0.6 0 0 0.6 0 3)">
              <path d="M56 43C56 43.76 55.58 44.42 54.94 44.76L39.14 53.64C38.82 53.88 38.42 54 38 54C37.58 54 37.18 53.88 36.86 53.64L21.06 44.76C20.42 44.42 20 43.76 20 43V25C20 24.24 20.42 23.58 21.06 23.24L36.86 14.36C37.18 14.12 37.58 14 38 14C38.42 14 38.82 14.12 39.14 14.36L54.94 23.24C55.58 23.58 56 24.24 56 25V43ZM26.08 25L38 31.7L49.92 25L38 18.3L26.08 25ZM24 41.82L36 48.58V35.16L24 28.42V41.82ZM52 41.82V28.42L40 35.16V48.58L52 41.82Z" fill="white"/>
            </g>
          </svg>

          <!-- right icon (red). viewbox needs to correspond to --switch-width and the cx of the circle to half that -->
          <svg class="icon icon-right"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 140 45"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true">
            <circle cx="70" cy="22.5" r="22.5" fill="#FB0F5A"/>
            <g transform="matrix(0.6 0 0 0.6 -6 3)">
              <path d="M147 25C147 24.24 146.58 23.58 145.94 23.24L130.14 14.36C129.82 14.12 129.42 14 129 14C128.58 14 128.18 14.12 127.86 14.36L112.06 23.24C111.42 23.58 111 24.24 111 25V43C111 43.76 111.42 44.42 112.06 44.76L127.86 53.64C128.18 53.88 128.58 54 129 54C129.42 54 129.82 53.88 130.14 53.64L145.94 44.76C146.58 44.42 147 43.76 147 43V25ZM115 26.18L127 19.42V32.84L115 39.58V26.18ZM143 26.18V39.58L131 32.84V19.42L143 26.18Z" fill="white"/>
            </g>
          </svg>
        </span>
      </label>
    `)

    const elements = Array.from(view)
    const [container] = /** @type {HTMLElement[]} */ (elements)
    gameController.switchModeController?.notifySetupFinished(container)

    return view
}

const projectJoystickPositionControl = (gameController) => {
    const view = dom(`
    <aside class="joystick-position-control">
      <div class="joystick-frame">
        <div class="joystick-pad" role="group" aria-label="Move tetromino">
          <svg class="joystick-border joystick-border-up" data-direction="up" xmlns="http://www.w3.org/2000/svg" width="139" height="22" viewBox="0 0 139 22" fill="none">
            <path d="M133.302 4.5L121.251 16.5508H17.2578L5.20703 4.5H133.302Z" shape-rendering="crispEdges"/>
            <defs>
              <radialGradient id="gradient-up">
                <stop stop-color="#F5FFE0"/>
                <stop offset="0.216346" stop-color="#ECFFC2"/>
                <stop offset="0.495192" stop-color="#E0FF9E"/>
                <stop offset="1" stop-color="#AFFF02"/>
              </radialGradient>
            </defs>
          </svg>
          <svg class="joystick-border joystick-border-right" data-direction="right" xmlns="http://www.w3.org/2000/svg" width="22" height="139" viewBox="0 0 22 139" fill="none">
            <path d="M16.5508 133.302L4.5 121.251L4.5 17.2578L16.5508 5.20703L16.5508 133.302Z" shape-rendering="crispEdges"/>
            <defs>
              <radialGradient id="gradient-right">
                <stop stop-color="#EAE0FF"/>
                <stop offset="0.216346" stop-color="#D6C2FF"/>
                <stop offset="0.495192" stop-color="#BE9EFF"/>
                <stop offset="1" stop-color="#8447FF"/>
              </radialGradient>
            </defs>
          </svg>
          <svg class="joystick-border joystick-border-down" data-direction="down" xmlns="http://www.w3.org/2000/svg" width="139" height="22" viewBox="0 0 139 22" fill="none">
            <path d="M5.20654 16.5508L17.2573 4.5L121.25 4.5L133.301 16.5508L5.20654 16.5508Z"/>
            <defs>
              <radialGradient id="gradient-down">
                <stop stop-color="#E0FFFF"/>
                <stop offset="0.216346" stop-color="#C2FFFF"/>
                <stop offset="0.495192" stop-color="#9EFFFF"/>
                <stop offset="1" stop-color="#02FFFF"/>
              </radialGradient>
            </defs>
          </svg>
          <svg class="joystick-border joystick-border-left" data-direction="left" xmlns="http://www.w3.org/2000/svg" width="22" height="139" viewBox="0 0 22 139" fill="none">
            <path d="M4.5 5.20654L16.5508 17.2573L16.5508 121.25L4.5 133.301L4.5 5.20654Z" />
            <defs>
              <radialGradient id="gradient-left">
                <stop stop-color="#FFE0EA"/>
                <stop offset="0.216346" stop-color="#FFC2D6"/>
                <stop offset="0.495192" stop-color="#FF9EBC"/>
                <stop offset="1" stop-color="#FB0F5A"/>
              </radialGradient>
            </defs>
          </svg>
          <div class="joystick-center">
            <div class="joystick-center-ring"></div>
            <div class="joystick-center-ring"></div>
          </div>
          <div class="joystick-center-base"></div>
        </div>
      </div>
    </aside>`)

    const mainElement = view[0]
    const [padElement] = select(mainElement, '.joystick-pad')

    gameController.joystickPositionController.registerPointerHandlers(
        padElement
    )
    gameController.joystickPositionController.resetCenterOffset(
        padElement,
        0,
        0
    )

    gameController.joystickPositionController.onCenterOffsetChanged(
        ({ x, y }) => {
            padElement.style.setProperty('--joystick-center-offset-x', `${x}px`)
            padElement.style.setProperty('--joystick-center-offset-y', `${y}px`)
        }
    )

    gameController.joystickPositionController.onDirectionChanged(
        (direction) => {
            if (direction) {
                padElement.dataset.direction = direction
            } else {
                delete padElement.dataset.direction
            }
        }
    )

    return view
}

const projectMusic = (gameController) => {
    const view = dom(`
      <div>
        <button class="audio-control" title="Toggle Music">🎵</button>
        <audio id="background-music" loop>
            <source src="/sounds/music.mp3" type="audio/mpeg">
        </audio>
        </div>`)

    const mainElement = view[0]
    const [audioButton] = select(mainElement, '.audio-control')
    const [audio] = select(mainElement, 'audio')

    // Audio control functionality
    const musicController = gameController.musicController

    musicController.onMute(() => {
        audio.pause()
        audioButton.classList.add('muted')
        audioButton.textContent = '🔇'
    })

    musicController.onPlay(() => {
        audio.play().catch((e) => console.log('Audio play failed:', e))
        audioButton.classList.remove('muted')
        audioButton.textContent = '🎵'
    })

    // Set audio volume to a reasonable level
    audio.volume = 0.2

    audioButton.onclick = () => {
        musicController.toggle()
    }

    return view
}

const projectStartRestart = (gameController) => {
    const view = dom(`
      <div>
        <button class="start-button" title="Start / Restart">▶</button>
      </div>`)

    const mainElement = view[0]
    const [startButton] = select(mainElement, '.start-button')

    // data binding

    const playerController = gameController.playerController
    playerController.onActivePlayerIdChanged((_) => {
        if (playerController.areWeInCharge()) {
            startButton.classList.remove('muted')
            startButton.removeAttribute('disabled')
        } else {
            startButton.classList.add('muted')
            startButton.setAttribute('disabled', '')
        }
    })

    // Using direct property assignment (onclick) overwrites any previous listeners
    // Only the last assignment will be executed when the button is clicked
    startButton.onclick = (_) => {
        startButton.textContent = '↩'
        startButton.setAttribute('disabled', '') // double-click protection
        gameController.restart(() => {
            if (!playerController.areWeInCharge()) return
            startButton.removeAttribute('disabled')
        })
    }

    return view
}

const projectGameControlButtons = (gameController) => {
    const view = dom(`<div class="bottom-control"></div>`)
    const mainElement = view[0]
    mainElement.append(
        ...projectMusic(gameController),
        ...projectStartRestart(gameController)
    )
    return view
}

const projectLeftSideControl = (gameController) => {
    const view = dom(`<aside class="left-side-control"></aside>`)
    const mainElement = view[0]
    mainElement.append(
        ...projectJoystickPositionControl(gameController),
        ...projectSwitchModeControl(gameController)
    )
    return view
}

/**
 * @param { import("./gameController.js").GameControllerType} gameController
 * @return { Array<HTMLElement> }
 */
const projectGame = (gameController) => {
    return [
        ...projectControlPanel(gameController),
        ...projectMain(gameController),
        ...projectGameControlButtons(gameController),
        ...projectControlPanel(gameController),
        ...projectLeftSideControl(gameController),
        ...projectAxisControl(gameController),
    ]
}
