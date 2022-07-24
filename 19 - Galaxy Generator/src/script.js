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
 * Galaxy
 */
const parameters = {
    count: 30000,
    size: 0.01,
    radius: 5,
    branches: 7,
    spin: 0.4,
    spreadRange: 0.2,
    spread: 4,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
}

let geometry = null, material = null, galaxy = null

const generateGalaxy = () => {

    if (galaxy !== null){
        geometry.dispose()
        material.dispose()
        scene.remove(galaxy)
    }

    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {

        // position
        const radius = Math.random() * parameters.radius
        let branchAngle = 2 * Math.PI * (i % parameters.branches) / parameters.branches
        branchAngle += radius * parameters.spin

        const randomX = (0.1 + radius) * parameters.spreadRange * Math.pow(Math.random(), parameters.spread) * Math.sign(Math.random() - 0.5)
        const randomY = (0.1 + radius) * parameters.spreadRange * Math.pow(Math.random(), parameters.spread) * Math.sign(Math.random() - 0.5)
        const randomZ = (0.1 + radius) * parameters.spreadRange * Math.pow(Math.random(), parameters.spread) * Math.sign(Math.random() - 0.5)

        positions[3 * i    ] = radius * Math.cos(branchAngle) + randomX
        positions[3 * i + 1] = 0 + randomY
        positions[3 * i + 2] = radius * Math.sin(branchAngle) + randomZ

        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        // color
        colors[3 * i    ] = mixedColor.r
        colors[3 * i + 1] = mixedColor.g
        colors[3 * i + 2] = mixedColor.b
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })

    galaxy = new THREE.Points(geometry, material)

    scene.add(galaxy)
}

generateGalaxy();

gui.add(parameters, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(0.01).max(1).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'spreadRange').min(0.01).max(1).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'spread').min(1).max(10).step(0.1).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

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
    camera.position.set(3, 3, 3); // Default starting position
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()