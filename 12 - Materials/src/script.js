import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

// Debug
const gui = new GUI()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const doorTextures = {
    color: textureLoader.load('/textures/door/color.jpg'),
    alpha: textureLoader.load('/textures/door/alpha.jpg'),
    ambiantOcclusion: textureLoader.load('/textures/door/ambientOcclusion.jpg'),
    height: textureLoader.load('/textures/door/height.jpg'),
    normal: textureLoader.load('/textures/door/normal.jpg'),
    metalness: textureLoader.load('/textures/door/metalness.jpg'),
    roughness: textureLoader.load('/textures/door/roughness.jpg'),
}
const matcapTexture = textureLoader.load('/textures/matcaps/1.png')
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/3/px.jpg',
    '/textures/environmentMaps/3/nx.jpg',
    '/textures/environmentMaps/3/py.jpg',
    '/textures/environmentMaps/3/ny.jpg',
    '/textures/environmentMaps/3/pz.jpg',
    '/textures/environmentMaps/3/nz.jpg',
])
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const material = new THREE.MeshStandardMaterial()
// material.map = doorTextures.color
// material.aoMap = doorTextures.ambiantOcclusion
// material.displacementMap = doorTextures.height
// material.displacementScale = 0.05
// material.metalnessMap = doorTextures.metalness
// material.roughnessMap = doorTextures.roughness
// material.normalMap = doorTextures.normal
material.metalness = 0.8
material.roughness = 0.05
material.envMap = environmentMapTexture

gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)
gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.001)
gui.add(material, 'displacementScale').min(0).max(1).step(0.001)

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 128, 128),
    material
    )
plane.position.x = -1.5
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64),
    material
)
const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 16, 32),
    material
)
torus.position.x = 1.5

scene.add(sphere, plane, torus)

scene.children.filter(child => child.type === "Mesh").forEach(mesh => {
    mesh.geometry.setAttribute(
        'uv2',
        new THREE.BufferAttribute(mesh.geometry.attributes.uv.array, 2),
    )
})

// Lights
const ambiantLight = new THREE.AmbientLight(0xffffff, 0.3)
const pointLight = new THREE.PointLight(0xffffff, 0.7)
pointLight.position.set(1, 1, 1)
scene.add(ambiantLight, pointLight)

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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

    // Update obejcts
    sphere.rotation.y = 0.1 * elapsedTime
    plane.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.z = 0.15 * elapsedTime
    plane.rotation.z = 0.15 * elapsedTime
    torus.rotation.z = 0.15 * elapsedTime


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()