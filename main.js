import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 6;

let robotModel;
let baseRotationY = 0;

const canvasEl = document.getElementById('robot-canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 1.2));
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(3, 5, 5);
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
dirLight2.position.set(-3, 2, -5);
scene.add(dirLight2);

// Load model
const loader = new GLTFLoader();
loader.load(
  'model/robot.glb',
  (gltf) => {
    robotModel = gltf.scene;
    scene.add(robotModel);

    const box = new THREE.Box3().setFromObject(robotModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    robotModel.position.x -= center.x;
    robotModel.position.y -= center.y;
    robotModel.position.z -= center.z;

    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 2.5;
    camera.near = maxDim / 100;
    camera.far = maxDim * 100;
    camera.updateProjectionMatrix();

    robotModel.position.x += maxDim * 0.8;

    baseRotationY = -2.0;
    robotModel.rotation.y = baseRotationY;
  },
  undefined,
  (error) => console.error('Gagal load model:', error)
);

// Mouse tracking
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function getHeroOpacity() {
  const fadeEnd = window.innerHeight * 0.8;
  const scrolled = window.scrollY;
  return Math.max(0, 1 - scrolled / fadeEnd);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  if (robotModel) {
    const targetRotY = baseRotationY + mouse.x * 0.3;
    const targetRotX = mouse.y * 0.2;
    robotModel.rotation.y += (targetRotY - robotModel.rotation.y) * 0.08;
    robotModel.rotation.x += (-targetRotX - robotModel.rotation.x) * 0.08;
  }
  canvasEl.style.opacity = getHeroOpacity();
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Scroll button
document.getElementById('scrollBtn').addEventListener('click', () => {
  document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  const btn = document.getElementById('scrollBtn');
  btn.style.opacity = window.scrollY > 100 ? '0' : '1';
  btn.style.pointerEvents = window.scrollY > 100 ? 'none' : 'auto';
});