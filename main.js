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

// Blink setup
const eyeNames = ['Curve002', 'Curve003'];
const pupilNames = ['Curve006', 'Curve007'];
let blinkTargets = [];

let blinkState = 'idle'; // idle, closing, opening
let blinkProgress = 0;
let nextBlinkTime = performance.now() + randomBlinkDelay();

function randomBlinkDelay() {
  return 2000 + Math.random() * 3000; //
}

function updateBlink(now) {
  if (blinkTargets.length === 0) return;

  if (blinkState === 'idle' && now >= nextBlinkTime) {
    blinkState = 'closing';
    blinkProgress = 0;
  }

  if (blinkState === 'closing' || blinkState === 'opening') {
    blinkProgress += 0.25;

    let scaleY;
    if (blinkState === 'closing') {
      scaleY = 1 - Math.min(blinkProgress, 1);
      if (blinkProgress >= 1) {
        blinkState = 'opening';
        blinkProgress = 0;
      }
    } else {
      scaleY = Math.min(blinkProgress, 1);
      if (blinkProgress >= 1) {
        blinkState = 'idle';
        nextBlinkTime = now + randomBlinkDelay();
        scaleY = 1;
      }
    }

    scaleY = Math.max(scaleY, 0.05);

    blinkTargets.forEach(({ mesh, originalY }) => {
      mesh.scale.y = scaleY;
      mesh.position.y = originalY + (1 - scaleY) * 0.05; //
    });
  }
}

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
    camera.position.z = maxDim * 2.2;
    camera.near = maxDim / 100;
    camera.far = maxDim * 100;
    camera.updateProjectionMatrix();

    robotModel.position.x += maxDim * 0.8;

    baseRotationY = -2.0;
    robotModel.rotation.y = baseRotationY;

    robotModel.traverse((child) => {
      if (eyeNames.includes(child.name) || pupilNames.includes(child.name)) {
        blinkTargets.push({
          mesh: child,
          originalY: child.position.y, // simpan posisi Y asli mesh
        });
      }
    });
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
  const now = performance.now();

  if (robotModel) {
    const targetRotY = baseRotationY + mouse.x * 0.3;
    const targetRotX = mouse.y * 0.2;
    robotModel.rotation.y += (targetRotY - robotModel.rotation.y) * 0.08;
    robotModel.rotation.x += (-targetRotX - robotModel.rotation.x) * 0.08;
    updateBlink(now);
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

// --- Script untuk Efek Kursor Bintang Ungu ---
document.addEventListener('mousemove', function(e) {
    // 1. Membuat elemen div baru untuk bintang
    const star = document.createElement('div');
    star.className = 'star-trail';
    
    // 2. Menentukan posisi bintang sesuai dengan posisi kursor saat itu
    star.style.left = e.pageX + 'px';
    star.style.top = e.pageY + 'px';
    
    // 3. Menambahkan bintang ke dalam body halaman
    document.body.appendChild(star);
    
    // 4. Menghapus bintang setelah 800ms (sesuai durasi animasi di CSS) agar web tidak berat
    setTimeout(() => {
        star.remove();
    }, 800);
});