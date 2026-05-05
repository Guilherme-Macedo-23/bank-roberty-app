import { Application } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';
import { PreloaderScene } from './scenes/PreloaderScene.js';
import { GameScene } from './scenes/GameScene.js';

(async () => {
  const app = new Application();
  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x0a0500,
    antialias: true,
    // Use devicePixelRatio for sharp rendering on Retina / high-DPI mobile screens
    resolution: Math.min(window.devicePixelRatio ?? 1, 2),
    autoDensity: true,
  });

  document.body.appendChild(app.canvas);
  window.__PIXI_APP__ = app;

  // ── Responsive scaling ──────────────────────────────────────────
  function resize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Fit the canvas inside the viewport while keeping the 16:9 ratio
    const scaleX = vw / GAME_WIDTH;
    const scaleY = vh / GAME_HEIGHT;
    const scale  = Math.min(scaleX, scaleY);

    const cw = Math.floor(GAME_WIDTH  * scale);
    const ch = Math.floor(GAME_HEIGHT * scale);

    app.canvas.style.width  = `${cw}px`;
    app.canvas.style.height = `${ch}px`;

    // Center horizontally & vertically via body flexbox (set in CSS)
    // No extra positioning needed — body uses flex center
  }

  resize();
  window.addEventListener('resize',            resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 150));

  // ── Scene management ────────────────────────────────────────────
  let currentScene = null;

  function showGame() {
    if (currentScene) {
      app.stage.removeChild(currentScene);
      currentScene.destroy({ children: true });
    }
    const scene = new GameScene(app);
    app.stage.addChild(scene);
    currentScene = scene;
  }

  const preloader = new PreloaderScene(showGame);
  app.stage.addChild(preloader);
  await preloader.init();
})();
