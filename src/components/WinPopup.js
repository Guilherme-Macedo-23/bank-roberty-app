import { Container, Graphics, AnimatedSprite, Text, Assets } from 'pixi.js';
import {
  GAME_WIDTH, GAME_HEIGHT, WIN_TYPES,
  FRAME_X, FRAME_Y, FRAME_W, FRAME_H,
} from '../config.js';
import { getWinTextures } from '../AssetManifest.js';

// Win animation frame size: 788 × 653 px
// Target: fit within the slot frame (FRAME_W=673, FRAME_H=400)
const WIN_FRAME_W = 788;
const WIN_FRAME_H = 653;
const TARGET_W    = FRAME_W * 0.88;           // ~592px
const WIN_SCALE   = TARGET_W / WIN_FRAME_W;   // ≈ 0.75 — fits in frame

const FRAME_CX = FRAME_X + FRAME_W / 2;
const FRAME_CY = FRAME_Y + FRAME_H / 2 - 20;

const AMOUNT_STYLE = {
  fontFamily: 'Arial Black, Impact, sans-serif',
  fontSize: 30,
  fill: 0xffd700,
  fontWeight: 'bold',
  dropShadow: { color: 0x000000, blur: 6, distance: 3 },
};

export class WinPopup extends Container {
  constructor() {
    super();
    this.visible = false;
    this._animation  = null;
    this._amtText    = null;
    this._onDismiss  = null;
    this._dismissTimer = null;

    // Dim overlay — only over the slot frame area
    const overlay = new Graphics();
    overlay.rect(FRAME_X, FRAME_Y, FRAME_W, FRAME_H);
    overlay.fill({ color: 0x000000, alpha: 0.6 });
    this.addChild(overlay);

    // Click overlay to dismiss early
    overlay.eventMode = 'static';
    overlay.cursor    = 'pointer';
    overlay.on('pointerdown', () => this._dismiss());
  }

  show(winAmount, onDismiss) {
    this._onDismiss = onDismiss;
    this._clearAnimation();

    // Pick win type by amount
    const winType = WIN_TYPES.find(w => winAmount >= w.minValue)
      ?? WIN_TYPES[WIN_TYPES.length - 1];

    const textures = getWinTextures(Assets, winType.name, winType.frames);
    const anim     = new AnimatedSprite(textures);
    anim.animationSpeed = 0.45;
    anim.loop           = false;
    anim.anchor.set(0.5, 0.5);
    anim.x = FRAME_CX;
    anim.y = FRAME_CY;
    anim.scale.set(WIN_SCALE);
    anim.onComplete = () => {
      this._dismissTimer = setTimeout(() => this._dismiss(), 2800);
    };
    this._animation = anim;
    this.addChild(anim);

    // Win amount text — below animation center
    const amtText = new Text({
      text: `$ ${winAmount.toLocaleString()}`,
      style: AMOUNT_STYLE,
    });
    amtText.anchor.set(0.5, 0.5);
    amtText.x = FRAME_CX;
    amtText.y = FRAME_Y + FRAME_H - 36;
    this._amtText = amtText;
    this.addChild(amtText);

    this.visible = true;
    anim.play();
  }

  _clearAnimation() {
    clearTimeout(this._dismissTimer);
    if (this._animation) {
      this._animation.stop();
      this.removeChild(this._animation);
      this._animation.destroy();
      this._animation = null;
    }
    if (this._amtText) {
      this.removeChild(this._amtText);
      this._amtText.destroy();
      this._amtText = null;
    }
  }

  _dismiss() {
    this._clearAnimation();
    this.visible = false;
    this._onDismiss?.();
  }
}
