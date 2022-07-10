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

// Fog
const fog = new THREE.Fog('#262837', 1, 15)
scene.fog = fog

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const doorTextures = {
    color: textureLoader.load('/textures/door/color.jpg'),
    alpha: textureLoader.load('/textures/door/alpha.jpg'),
    ambientOcclusion: textureLoader.load('/textures/door/ambientOcclusion.jpg'),
    height: textureLoader.load('/textures/door/height.jpg'),
    normal: textureLoader.load('/textures/door/normal.jpg'),
    metalness: textureLoader.load('/textures/door/metalness.jpg'),
    roughness: textureLoader.load('/textures/door/roughness.jpg'),
}

const bricksTextures = {
    color: textureLoader.load('/textures/bricks/color.jpg'),
    ambientOcclusion: textureLoader.load('/textures/bricks/ambientOcclusion.jpg'),
    normal: textureLoader.load('/textures/bricks/normal.jpg'),
    roughness: textureLoader.load('/textures/bricks/roughness.jpg'),
}

const grassTextures = {
    color: textureLoader.load('/textures/grass/color.jpg'),
    ambientOcclusion: textureLoader.load('/textures/grass/ambientOcclusion.jpg'),
    normal: textureLoader.load('/textures/grass/normal.jpg'),
    roughness: textureLoader.load('/textures/grass/roughness.jpg'),
}
grassTextures.color.repeat.set(8, 8)
grassTextures.ambientOcclusion.repeat.set(8, 8)
grassTextures.normal.repeat.set(8, 8)
grassTextures.roughness.repeat.set(8, 8)

grassTextures.color.wrapS = THREE.RepeatWrapping
grassTextures.ambientOcclusion.wrapS = THREE.RepeatWrapping
grassTextures.normal.wrapS = THREE.RepeatWrapping
grassTextures.roughness.wrapS = THREE.RepeatWrapping

grassTextures.color.wrapT = THREE.RepeatWrapping
grassTextures.ambientOcclusion.wrapT = THREE.RepeatWrapping
grassTextures.normal.wrapT = THREE.RepeatWrapping
grassTextures.roughness.wrapT = THREE.RepeatWrapping

/**
 * House
 */
const house = new THREE.Group()
scene.add(house)

// Walls
const walls = new THREE.Mesh(
    new THREE.BoxBufferGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({ 
        map: bricksTextures.color,
        aoMap: bricksTextures.ambientOcclusion,
        normalMap: bricksTextures.normal,
        roughnessMap: bricksTextures.roughness
    })
)
walls.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2),
)
walls.position.y = 2.5 / 2
house.add(walls)
 
// Roof
const roof = new THREE.Mesh(
    new THREE.ConeBufferGeometry(3, 1, 4),
    new THREE.MeshStandardMaterial({ color: '#b35f45' })
)
roof.position.y = 2.5 + 0.5
roof.rotation.y = Math.PI / 4
house.add(roof)

// Door
const door = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2, 128, 128),
    new THREE.MeshStandardMaterial({
        map: doorTextures.color,
        transparent: true,
        alphaMap: doorTextures.alpha,
        aoMap: doorTextures.ambientOcclusion,
        displacementMap: doorTextures.height,
        displacementScale: 0.1,
        normalMap: doorTextures.normal,
        metalnessMap: doorTextures.metalness,
        roughnessMap: doorTextures.roughness,
    })
)
door.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2),
)
door.position.y = 1
door.position.z = 2 + 0.01
house.add(door)

// Bushes
const bushGeom = new THREE.SphereBufferGeometry(1, 16, 16)
const bushMat = new THREE.MeshStandardMaterial({ color: '#89c854'})

const bush1 = new THREE.Mesh(bushGeom, bushMat)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)

const bush2 = new THREE.Mesh(bushGeom, bushMat)
bush2.scale.set(0.2, 0.2, 0.2)
bush2.position.set(1.4, 0.05, 2.1)

const bush3 = new THREE.Mesh(bushGeom, bushMat)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8, 0.1, 2.2)

const bush4 = new THREE.Mesh(bushGeom, bushMat)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(-1, 0.05, 2.6)

house.add(bush1, bush2, bush3, bush4)

// Graves
const graves = new THREE.Group()
scene.add(graves)

const graveGeom = new THREE.BoxBufferGeometry(0.6, 0.8, 0.2)
const graveMat = new THREE.MeshStandardMaterial({ color: '#b2b6b1'})

for (let i = 0; i < 60; i++) {
    const angle = 2 * Math.PI * Math.random();
    const radius = 3 + 6 * Math.random();
    const grave = new THREE.Mesh(graveGeom, graveMat)
    grave.position.set(
        radius * Math.sin(angle),
        0.3,
        radius * Math.cos(angle),
    )
    grave.rotation.set(
        0,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
    )
    grave.castShadow = true
    graves.add(grave)
}

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        map: grassTextures.color,
        aoMap: grassTextures.ambientOcclusion,
        normalMap: grassTextures.normal,
        roughnessMap: grassTextures.roughness
    })
)
floor.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2),
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
floor.receiveShadow = true
scene.add(floor)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12)
moonLight.position.set(4, 5, - 2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(moonLight)

const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
doorLight.position.set(0, 2.2, 2.7)
house.add(doorLight)

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
scene.add(ghost1)
const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
scene.add(ghost2)
const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
scene.add(ghost3)

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
const storedCamera = JSON.parse(localStorage.getItem('camera'))
if (storedCamera) {
    camera.position.set(
        storedCamera.position.x,
        storedCamera.position.y,
        storedCamera.position.z,
    )
} else {
    camera.position.x = 4
    camera.position.y = 2
    camera.position.z = 5
}
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
if (storedCamera) {
    controls.target.set(
        storedCamera.target.x,
        storedCamera.target.y,
        storedCamera.target.z,
    )
}
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#262837')

/**
 * Shadows
 */
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
moonLight.castShadow = true
doorLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

walls.castShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true

doorLight.shadow.mapSize.width = 256
doorLight.shadow.mapSize.height = 256
doorLight.shadow.camera.far = 7

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.far = 7

ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.camera.far = 7

ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.far = 7


/**
 * Animate
 */
const clock = new THREE.Clock()

function debounce(func, timeout = 120){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

controls.addEventListener(
    'change',
    debounce(() => localStorage.setItem('camera', JSON.stringify({
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
    }))),
);

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    
    // Update ghosts
    const angle1 = elapsedTime * 0.5
    ghost1.position.set(
        Math.cos(angle1) * 4,
        Math.sin(elapsedTime * 3),
        Math.sin(angle1) * 4,
    )

    const angle2 = -elapsedTime * 0.5
    ghost2.position.set(
        Math.cos(angle2) * 4,
        Math.sin(elapsedTime * 3) + Math.sin(elapsedTime * 2.5),
        Math.sin(angle2) * 4,
    )

    const angle3 = 13 - elapsedTime * 0.18
    ghost3.position.set(
        Math.cos(angle3) * (7 + Math.sin(elapsedTime * 0.32)),
        Math.sin(elapsedTime * 3) + Math.sin(elapsedTime * 2.5),
        Math.sin(angle3) * (7 + Math.sin(elapsedTime * 0.13)),
    )

    // Update controls
    controls.update()
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()