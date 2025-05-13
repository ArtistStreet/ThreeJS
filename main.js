import WindowManager from './WindowManager.js'

const t = THREE;
let camera, scene, renderer, world;
let pixR = window.devicePixelRatio || 1;
let planes = [];
let sceneOffset = { x: 0, y: 0 };
let sceneOffsetTarget = { x: 0, y: 0 };
let windowManager;
let initialized = false;

let texture;
let planeWidth;
let planeHeight;

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
          scene.background = new t.Color(0x000000);
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

          windowManager.init({});

          loadImageTexture();
     }

     function loadImageTexture() {
          const loader = new t.TextureLoader();
          loader.load('Bui_Thi_Ly.jpg', (tex) => {
               texture = tex;
               texture.flipY = false;

               const img = tex.image;
               const aspect = img.width / img.height;
               planeHeight = 400;
               planeWidth = planeHeight * aspect;

               updatePlanes();
          });
     }

     function updatePlanes() {
          const wins = windowManager.getWindows();

          planes.forEach(p => world.remove(p));
          planes = [];

          const mat = new t.MeshBasicMaterial({ map: texture, transparent: true, side: t.DoubleSide });

          const plane = new t.Mesh(new t.PlaneGeometry(planeWidth, planeHeight), mat);

          plane.position.x = (window.innerWidth - planeWidth) / 2;
          plane.position.y = (window.innerHeight - planeHeight) / 2;

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
                    x: (1920) / 2,
                    y: (960) / 2
               };

               plane.position.x += (posTarget.x - plane.position.x) * falloff;
               plane.position.y += (posTarget.y - plane.position.y) * falloff;
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

     }
}
