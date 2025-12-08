import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js'

const canvas = document.getElementById('fisheye')
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

const scene = new THREE.Scene()
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

const geometry = new THREE.PlaneGeometry(2, 2)
const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        time: { value: 0.0 },
        curvature: { value: 0.8 },
        scanLines: { value: 300.0 },
        scanLineAmplitude: { value: 0.05 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float curvature;
      uniform float scanLines;
      uniform float scanLineAmplitude;
      varying vec2 vUv;

      void main() {
        // Barrel distortion (fisheye curvature)
        vec2 uv = vUv - 0.5;
        float r = length(uv);
        uv += uv * (r * r * curvature);
        uv += 0.5;

        // Scanlines
        float scan = sin((uv.y + time * 0.1) * scanLines) * scanLineAmplitude;

        vec3 color = vec3(0.9, 0.4, 0.9);
        color -= scan;
        gl_FragColor = vec4(color, 0.1);
      }
    `,
})

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', onResize)

function animate(t) {
    material.uniforms.time.value = t * 0.001
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()
