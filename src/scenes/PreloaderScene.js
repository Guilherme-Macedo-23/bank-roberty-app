import { Container, Sprite, Graphics, Text, Assets } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { MANIFEST } from '../AssetManifest.js';

const TITLE_STYLE = {
  fontFamily: 'Arial Black, Impact, sans-serif',
  fontSize: 58,
  fill: 0xffd700,
  fontWeight: 'bold',
  dropShadow: {
    color: 0x8b4500,
    blur: 8,
    distance: 4,
  },
  stroke: { color: 0x5c2800, width: 6 },
};

const STATUS_STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 16,
  fill: 0xdddddd,
};

export class PreloaderScene extends Container {
  constructor(onComplete) {
    super();
    this._onComplete = onComplete;
  }

  async init() {
    // Register manifest
    Assets.addBundle('preloader', MANIFEST.bundles[0].assets);
    Assets.addBundle('symbols', MANIFEST.bundles[1].assets);
    Assets.addBundle('wins', MANIFEST.bundles[2].assets);

    // Load preloader bundle first (background + fox)
    await Assets.loadBundle('preloader');

    this._buildBackground();
    this._buildProgressBar();
    this._buildTitle();
    this._buildStatus();

    // Load remaining bundles with progress tracking
    let loaded = 0;
    const remaining = ['symbols', 'wins'];
    const total = remaining.length;

    for (const bundle of remaining) {
      await Assets.loadBundle(bundle, (p) => {
        const overall = (loaded + p) / total;
        this._setProgress(overall);
        this._statusText.text = `Loading... ${Math.round(overall * 100)}%`;
      });
      loaded++;
    }

    this._setProgress(1);
    this._statusText.text = 'Ready!';

    await new Promise(r => setTimeout(r, 400));
    this._onComplete();
  }

  _buildBackground() {
    const bg = Sprite.from('bg_preloader');
    bg.width = GAME_WIDTH;
    bg.height = GAME_HEIGHT;
    this.addChildAt(bg, 0);
  }

  _buildTitle() {
    const title = new Text({ text: 'BANK ROBBERY', style: TITLE_STYLE });
    title.anchor.set(0.5);
    title.x = GAME_WIDTH / 2;
    title.y = 155;
    this.addChild(title);

    const subtitle = new Text({ text: 'SLOT', style: { ...TITLE_STYLE, fontSize: 42 } });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_WIDTH / 2;
    subtitle.y = 215;
    this.addChild(subtitle);
  }

  _buildProgressBar() {
    const BAR_W = 480;
    const BAR_H = 30;
    const BAR_X = (GAME_WIDTH - BAR_W) / 2;
    const BAR_Y = 300;
    const RADIUS = BAR_H / 2;

    // Outer track
    const track = new Graphics();
    track.roundRect(BAR_X - 3, BAR_Y - 3, BAR_W + 6, BAR_H + 6, RADIUS + 3);
    track.fill({ color: 0x1a1a1a, alpha: 0.85 });
    track.stroke({ width: 2, color: 0x555555 });
    this.addChild(track);

    // Fill bar
    this._barFill = new Graphics();
    this._barFill.x = BAR_X;
    this._barFill.y = BAR_Y;
    this.addChild(this._barFill);
    this._barW = BAR_W;
    this._barH = BAR_H;
    this._barR = RADIUS;

    this._setProgress(0);
  }

  _setProgress(p) {
    if (!this._barFill) return;
    const w = Math.max(this._barR * 2, this._barW * Math.min(1, p));
    this._barFill.clear();
    this._barFill.roundRect(0, 0, w, this._barH, this._barR);
    this._barFill.fill({ color: 0x22cc22 });

    // Shine
    this._barFill.roundRect(4, 3, w - 8, this._barH / 2 - 4, this._barR);
    this._barFill.fill({ color: 0x66ff66, alpha: 0.35 });
  }

  _buildStatus() {
    this._statusText = new Text({ text: 'Loading...', style: STATUS_STYLE });
    this._statusText.anchor.set(0.5);
    this._statusText.x = GAME_WIDTH / 2;
    this._statusText.y = 345;
    this.addChild(this._statusText);
  }
}
