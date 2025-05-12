import WindowManager from './WindowManager.js'

const t = THREE;
let camera, scene, renderer, world;
let pixR = window.devicePixelRatio || 1;
let planes = [];
let sceneOffset = { x: 0, y: 0 };
let sceneOffsetTarget = { x: 0, y: 0 };
let windowManager;
let initialized = false;

let texture; // lưu texture ảnh
let planeWidth;
let planeHeight;

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const width = window.innerWidth;
const height = window.innerHeight;

console.log(`Chiều rộng: ${width}, Chiều cao: ${height}`);
window.addEventListener('resize', () => {
     console.log(`Chiều rộng: ${window.innerWidth}, Chiều cao: ${window.innerHeight}`);
});


const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, "#1a237e"); // Màu xanh đậm
gradient.addColorStop(1, "#ff7043"); // Màu cam nhạt

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

const backgroundTexture = new THREE.CanvasTexture(canvas);

if (new URLSearchParams(window.location.search).get("clear")) {
     localStorage.clear();
} else {
     document.addEventListener("visibilitychange", () => {
          if (document.visibilityState !== 'hidden' && !initialized) {
               init();
          }
     });

     window.onload = () => {
          if (document.visibilityState !== 'hidden') {
               init();
          }
     };

     function init() {
          initialized = true;
          setTimeout(() => {
               setupScene();
               setupWindowManager();
               resize();
               render();
               window.addEventListener('resize', resize);
          }, 500);
     }

     function setupScene() {
          camera = new t.OrthographicCamera(0, window.innerWidth, 0, window.innerHeight, -10000, 10000);
          camera.position.z = 1000;

          scene = new t.Scene();
          scene.background = new t.Color(0xffffff);
          // scene.background = backgroundTexture;

          scene.add(camera);

          renderer = new t.WebGLRenderer({ antialias: true, depthBuffer: true });
          renderer.setPixelRatio(pixR);

          world = new t.Object3D();
          scene.add(world);

          renderer.domElement.setAttribute("id", "scene");
          document.body.appendChild(renderer.domElement);
     }

     function setupWindowManager() {
          windowManager = new WindowManager();
          windowManager.setWinShapeChangeCallback(updateWindowShape);
          windowManager.setWinChangeCallback(updatePlanes);

          windowManager.init({}); // không cần metadata

          loadImageTexture();
     }

     function loadImageTexture() {
          const loader = new t.TextureLoader();
          loader.load(
               'Bui_Thi_Ly.jpg',
               (tex) => {
                    tex.flipY = false; // Fix the upside-down issue
                    texture = tex;

                    const img = tex.image;
                    const aspect = img.width / img.height;
                    planeHeight = 500;
                    planeWidth = planeHeight * aspect;

                    updatePlanes(); // sau khi có texture và size
               },
               undefined, // onProgress callback (not used here)
               (err) => {
                    console.error('Failed to load image:', err);
               }
          );
     }

     function updatePlanes() {
          const wins = windowManager.getWindows();

          // XÓA hết ảnh cũ (nếu có)
          planes.forEach(p => {
               world.remove(p);
               p.geometry.dispose();
               p.material.dispose();
          });
          planes = [];

          const mat = new t.MeshBasicMaterial({
               map: texture,
               transparent: true,
               side: t.DoubleSide
          });

          const plane = new t.Mesh(
               new t.PlaneGeometry(planeWidth, planeHeight),
               mat
          );

          // Đặt vị trí chính giữa cửa sổ
          plane.position.x = window.innerWidth / 2;
          // console.log("🚀 ~ updatePlanes ~ window.innerWidth:", window.innerWidth)
          plane.position.y = window.innerHeight / 2;

          world.add(plane);
          planes.push(plane);
     }

     function updateWindowShape() {
          sceneOffsetTarget = {
               x: -window.screenX,
               y: -window.screenY
          };
     }

     function render() {
          windowManager.update();

          const falloff = 0.05;

          sceneOffset.x += (sceneOffsetTarget.x - sceneOffset.x) * falloff;
          sceneOffset.y += (sceneOffsetTarget.y - sceneOffset.y) * falloff;

          world.position.x = sceneOffset.x;
          world.position.y = sceneOffset.y;

          const wins = windowManager.getWindows();
          for (let i = 0; i < planes.length; i++) {
               const plane = planes[i];
               const win = wins[i];

               const posTarget = {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2
               };

               plane.position.x += (posTarget.x - plane.position.x) * falloff;
               plane.position.y += (posTarget.y - plane.position.y) * falloff;
               // plane.position.x = window.innerWidth / 2;
               // plane.position.y = window.innerHeight / 2;
          }

          renderer.render(scene, camera);
          requestAnimationFrame(render);
     }

     function resize() {
          const width = window.innerWidth;
          const height = window.innerHeight;

          camera = new t.OrthographicCamera(0, width, 0, height, -10000, 10000);
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);

          // Cập nhật vị trí ảnh để luôn ở giữa cửa sổ
          if (planes.length > 0) {
               planes[0].position.x = window.innerWidth / 2;
               planes[0].position.y = window.innerHeight / 2;
          }
     }
}
