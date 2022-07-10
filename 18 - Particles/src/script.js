import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const particleTexture = textureLoader.load('/textures/particles/2.png')

/**
 * Particles
 */
const particlesGeom = new THREE.BufferGeometry()
const NB_PARTICLES = 10000;
const particlesVertices = new Float32Array(NB_PARTICLES * 3)
const colors = new Float32Array(NB_PARTICLES * 3)
for (let i = 0; i < NB_PARTICLES * 3; i++) {
    particlesVertices[i] = 4 * (Math.random() - 0.5)
    colors[i] = Math.random()
}
particlesGeom.setAttribute('position', new THREE.BufferAttribute(particlesVertices, 3))
particlesGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3))

const particlesMat = new THREE.PointsMaterial({
    // color: 'hotpink',
    size: 0.1,
    sizeAttenuation: true,
    alphaMap: particleTexture,
    transparent:true,
    // alphaTest: 0.001,
    // depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
})

const particles = new THREE.Points(particlesGeom, particlesMat)
scene.add(particles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
const storedCamera = JSON.parse(localStorage.getItem('camera'));
if (storedCamera) {
    camera.position.set(
        storedCamera.position.x,
        storedCamera.position.y,
        storedCamera.position.z,
    );
} else {
    camera.position.set(0, 0, 3); // Default starting position
}
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
if (storedCamera) {
    controls.target.set(
        storedCamera.target.x,
        storedCamera.target.y,
        storedCamera.target.z,
    );
}
  
function debounce(func, timeout = 120) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

controls.addEventListener(
    'change',
    // debounce is here to prevent saving to local storage every frame
    // when the controls have damping
    debounce(
        () => localStorage.setItem('camera', JSON.stringify({
            position: {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z,
            },
            target: {
                x: controls.target.x,
                y: controls.target.y,
                z: controls.target.z,
            },
        })),
    ),
);
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Animation
    for (let i = 0; i < NB_PARTICLES * 3; i += 3) {
        const x = particlesGeom.attributes.position.array[i]
        particlesGeom.attributes.position.array[i + 1] = Math.sin(elapsedTime + 2 * x)
    }

    particlesGeom.attributes.position.needsUpdate = true
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()