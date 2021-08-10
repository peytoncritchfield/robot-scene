import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import vertices from './lines.json'
import tubeFloorVertexShader from './shaders/tubeFloor/vertex.glsl'
import tubeFloorFragmentShader from './shaders/tubeFloor/fragment.glsl'
import robotVertexShader from './shaders/robot/vertex.glsl'
import robotFragmentShader from './shaders/robot/fragment.glsl'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'


/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// lines
let line1 = [];
for (var i = 0; i < vertices.line1.length; i++) {
    let x = vertices.line1[i][0];
    let y = vertices.line1[i][1];
    let z = vertices.line1[i][2];

    line1.push(new THREE.Vector3(x, y, z));
}

let line2 = [];
for (var i = 0; i < vertices.line2.length; i++) {
    let x = vertices.line2[i][0];
    let y = vertices.line2[i][1];
    let z = vertices.line2[i][2];

    line2.push(new THREE.Vector3(x, y, z));
}

const firstZLine1 = vertices.line1[0][2];
const lastZLine1 = vertices.line1[vertices.line1.length - 1][2];
let lineLength = lastZLine1 - firstZLine1;

const tubeFloorMaterial = new THREE.ShaderMaterial({
    vertexShader: tubeFloorVertexShader,
    fragmentShader: tubeFloorFragmentShader,
    transparent: true,
    uniforms: {
        uTime: { value: 0 },
        uReactiveLength: { value: 0 },
        uLineLength: { value: 0 }
    }
})



const tubeGeometry1 = new THREE.TubeGeometry( new THREE.CatmullRomCurve3(line1), 100, 0.05, 8, true );
const tubeMesh1 = new THREE.Mesh( tubeGeometry1, tubeFloorMaterial );
scene.add( tubeMesh1 );
tubeMesh1.layers.enable(0);

const tubeGeometry2 = new THREE.TubeGeometry( new THREE.CatmullRomCurve3(line2), 100, 0.05, 8, true );
const tubeMesh2 = new THREE.Mesh( tubeGeometry2, tubeFloorMaterial );
scene.add( tubeMesh2 );
tubeMesh2.layers.enable(0);


const robotMaterial = new THREE.ShaderMaterial({
    vertexShader: robotVertexShader,
    fragmentShader: robotFragmentShader,
    transparent: true,
    uniforms: {
        uTime: { value: 0 },
        uReactiveLength: { value: 0 },
        uLineLength: { value: 0 },
        uAdjustmentY: { value: 0 }
    }
})

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

//textures
const bakedTexture = textureLoader.load('robot/baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding



// Baked Material
const bakedMaterial = new THREE.MeshBasicMaterial({ 
    map: bakedTexture
 })



 // Model
gltfLoader.load(
    'robot/robotNew.glb', 
    (gltf) => 
    {
        console.log(gltf)

        

        gltf.scene.traverse((child) =>
        {
            child.material = bakedMaterial
        })

        const robot = gltf.scene.children.find((child) => child.name === 'Cube008')

        robot.material = robotMaterial

        robotMaterial.uniforms.uAdjustmentY.value = robot.position.y

        for (let i = 0; i < gltf.scene.children.length; i++)
        {
            if (i !== 11) {
                gltf.scene.children[i].layers.enable(0)
            } else {
                gltf.scene.children[i].layers.enable(1)
            }
        }



        scene.add(gltf.scene)

    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.autoClear = false
renderer.outputEncoding = THREE.sRGBEncoding


// render target
let RenderTargetClass = null

if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2)
{
    RenderTargetClass = THREE.WebGLMultisampleRenderTarget
    console.log("Multi")
}
else
{
    RenderTargetClass = THREE.WebGLRenderTarget
    console.log("Not Multi")
}
const renderTarget = new THREE.WebGLRenderTarget(
    800,
    600,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
    }
)

// composer
const composer = new EffectComposer( renderer, renderTarget )
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
composer.setSize(sizes.width, sizes.height)


// event listener
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

let scrollY = 0;
let clientHeight = window.document.body.clientHeight;

window.addEventListener("scroll", function () {
    scrollY = window.scrollY;
    clientHeight = window.document.body.clientHeight;
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(50.25383781964611, 15.86425160640591, 30.24067475534197)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


// render pass
const renderScene = new RenderPass(scene, camera)
composer.addPass( renderScene )


// bloom pass
const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.strength = 1
unrealBloomPass.radius = 0.1
unrealBloomPass.threshold = 0
composer.addPass( unrealBloomPass )


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    tubeFloorMaterial.uniforms.uTime.value = elapsedTime;
    tubeFloorMaterial.uniforms.uReactiveLength.value = ((scrollY / clientHeight) * 75.0);
    tubeFloorMaterial.uniforms.uLineLength.value = lineLength;
    robotMaterial.uniforms.uTime.value = elapsedTime;
    robotMaterial.uniforms.uReactiveLength.value = ((scrollY / clientHeight) * 75.0);
    robotMaterial.uniforms.uLineLength.value = lineLength;

    // Update controls
    controls.update()

    
    // Render
    camera.layers.set(1);
    
    composer.render();

    renderer.clearDepth();
    camera.layers.set(0);

    renderer.render(scene, camera)


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()