import { Container, Graphics, AnimatedSprite } from 'pixi.js';
import {
  REEL_COLS, REEL_ROWS, CELL_W, CELL_H, SYMBOLS,
} from '../config.js';
import { getSymbolTextures } from '../AssetManifest.js';

const SPIN_SPEED_MAX  = 45;
const SPIN_SPEED_MIN  = 4;
const SPIN_TICKS_MIN  = 48;
const REEL_STOP_DELAY = 22;

const ANIM_SPEED = {
  default: 0.35,
  Dynamit: 0.55,
  Bank:    0.40,
};
const SPIN_ANIM_SPEED = 0.7;

// Breathing (scale pulse)
const BREATHE_AMP   = 0.07;   // ±7% scale change
const BREATHE_SPEED = 0.025;  // radians per ticker tick

function weightedRandom(symbols) {
  const total = symbols.reduce((s, sym) => s + sym.weight, 0);
  let r = Math.random() * total;
  for (const sym of symbols) {
    r -= sym.weight;
    if (r <= 0) return sym;
  }
  return symbols[symbols.length - 1];
}

class Reel extends Container {
  constructor(colIndex, textureMap) {
    super();
    this._col         = colIndex;
    this._texMap      = textureMap;
    this._entries     = [];
    this._speed       = 0;
    this._spinning    = false;
    this._ticks       = 0;
    this._stopAfter   = 0;
    this._resolve     = null;
    this._breatheTime = 0;

    for (let row = -1; row < REEL_ROWS; row++) {
      const sym    = weightedRandom(SYMBOLS);
      const sprite = this._makeSprite(sym);
      // Center anchor: position is the CENTER of the cell
      sprite.y = row * CELL_H + CELL_H / 2;
      this.addChild(sprite);
      const phase = ((this._col * 1.3) + ((row + 1) * 0.7)) % (Math.PI * 2);
      this._entries.push({ sprite, sym, phase });
    }
  }

  _makeSprite(sym) {
    const textures = this._texMap[sym.id];
    const sprite   = new AnimatedSprite(textures);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = CELL_W / 2;

    // Set pixel size — PixiJS internally adjusts scale.x/y
    sprite.width  = CELL_W - 14;
    sprite.height = CELL_H - 10;

    // Save base scale AFTER width/height so breathing multiplies correctly
    sprite._bsx = sprite.scale.x;
    sprite._bsy = sprite.scale.y;

    sprite.animationSpeed = ANIM_SPEED[sym.id] ?? ANIM_SPEED.default;
    // Stagger start frame so symbols don't all animate in sync
    sprite.currentFrame = Math.floor(Math.random() * textures.length);
    sprite.play();
    return sprite;
  }

  _swapSymbol(entry, sym) {
    const textures        = this._texMap[sym.id];
    entry.sprite.textures = textures;
    entry.sprite.animationSpeed = this._spinning
      ? SPIN_ANIM_SPEED
      : (ANIM_SPEED[sym.id] ?? ANIM_SPEED.default);
    entry.sprite.currentFrame = 0;
    entry.sprite.play();
    // Re-fit to cell and save new base scale
    entry.sprite.width  = CELL_W - 14;
    entry.sprite.height = CELL_H - 10;
    entry.sprite._bsx   = entry.sprite.scale.x;
    entry.sprite._bsy   = entry.sprite.scale.y;
    entry.sym = sym;
  }

  spin(stopAfterTicks) {
    this._spinning  = true;
    this._ticks     = 0;
    this._stopAfter = stopAfterTicks;
    this._speed     = SPIN_SPEED_MIN;
    for (const e of this._entries) {
      e.sprite.animationSpeed = SPIN_ANIM_SPEED;
      // Reset scale to base (no breathing during spin)
      e.sprite.scale.x = e.sprite._bsx;
      e.sprite.scale.y = e.sprite._bsy;
    }
    return new Promise(resolve => { this._resolve = resolve; });
  }

  tick() {
    if (this._spinning) {
      this._tickSpin();
    } else {
      this._tickBreathe();
    }
  }

  _tickSpin() {
    this._ticks++;
    if (this._ticks < 15 && this._speed < SPIN_SPEED_MAX) this._speed += 3;

    const decelerating = this._ticks >= this._stopAfter;
    if (decelerating) this._speed = Math.max(SPIN_SPEED_MIN, this._speed - 2.5);

    // Move symbol centers downward
    for (const e of this._entries) e.sprite.y += this._speed;

    const visH = REEL_ROWS * CELL_H;
    for (const e of this._entries) {
      if (e.sprite.y - CELL_H / 2 >= visH) {
        const topCenter = Math.min(...this._entries.map(x => x.sprite.y));
        e.sprite.y = topCenter - CELL_H;
        this._swapSymbol(e, weightedRandom(SYMBOLS));
      }
    }

    if (decelerating && this._speed === SPIN_SPEED_MIN) {
      // Snap each sprite center to the nearest row center
      for (const e of this._entries) {
        const row  = Math.round((e.sprite.y - CELL_H / 2) / CELL_H);
        e.sprite.y = row * CELL_H + CELL_H / 2;
      }
      this._spinning = false;

      for (const e of this._entries) {
        e.sprite.animationSpeed = ANIM_SPEED[e.sym.id] ?? ANIM_SPEED.default;
        e.sprite.currentFrame   = 0;
      }

      const visH2    = REEL_ROWS * CELL_H;
      const visible  = this._entries
        .filter(e => e.sprite.y > 0 && e.sprite.y < visH2)
        .sort((a, b) => a.sprite.y - b.sprite.y);

      this._resolve?.(visible.map(e => e.sym));
    }
  }

  _tickBreathe() {
    this._breatheTime += BREATHE_SPEED;
    for (const e of this._entries) {
      const pulse = 1 + BREATHE_AMP * Math.sin(this._breatheTime + e.phase);
      // Multiply BASE scale by pulse — does not fight sprite.width assignment
      e.sprite.scale.x = e.sprite._bsx * pulse;
      e.sprite.scale.y = e.sprite._bsy * pulse;
    }
  }
}

export class ReelGrid extends Container {
  constructor(Assets) {
    super();
    this._texMap   = {};
    for (const sym of SYMBOLS) {
      this._texMap[sym.id] = getSymbolTextures(Assets, sym.id, sym.frames);
    }
    this._reels    = [];
    this._spinning = false;
    this._buildBackground();
    this._buildReels();
    this._buildOverlay();
  }

  _buildBackground() {
    const bg = new Graphics();
    bg.rect(0, 0, REEL_COLS * CELL_W + 4, REEL_ROWS * CELL_H + 4);
    bg.fill({ color: 0x080808 });
    this.addChild(bg);

    const mask = new Graphics();
    mask.rect(0, 0, REEL_COLS * CELL_W + 4, REEL_ROWS * CELL_H + 4);
    mask.fill(0xffffff);
    this.addChild(mask);
    this.mask = mask;
  }

  _buildReels() {
    for (let c = 0; c < REEL_COLS; c++) {
      const reel = new Reel(c, this._texMap);
      reel.x     = c * CELL_W + 2;
      reel.y     = 2;
      this.addChild(reel);
      this._reels.push(reel);
    }
  }

  _buildOverlay() {
    const ov = new Graphics();
    for (let c = 1; c < REEL_COLS; c++) {
      ov.rect(c * CELL_W, 0, 4, REEL_ROWS * CELL_H + 4);
      ov.fill({ color: 0xbb0000 });
    }
    this.addChild(ov);
  }

  get isSpinning() { return this._spinning; }

  async spin() {
    if (this._spinning) return null;
    this._spinning = true;
    const results = await Promise.all(
      this._reels.map((reel, i) =>
        reel.spin(SPIN_TICKS_MIN + i * REEL_STOP_DELAY)
      )
    );
    this._spinning = false;
    return results;
  }

  tick() {
    for (const reel of this._reels) reel.tick();
  }

  evaluateWin(results, bet) {
    if (!results) return { win: false, amount: 0 };
    let totalWin = 0;
    for (let row = 0; row < REEL_ROWS; row++) {
      const rowSyms = results.map(col => col[row]);
      if (!rowSyms[0]) continue;
      const first = rowSyms[0];
      let count = 1;
      for (let c = 1; c < REEL_COLS; c++) {
        if (rowSyms[c]?.id === first.id) count++;
        else break;
      }
      if (count >= 3) {
        const mult = count === 5 ? 25 : count === 4 ? 10 : 3;
        totalWin += bet * mult * (first.value / 5);
      }
    }
    return { win: totalWin > 0, amount: Math.round(totalWin) };
  }
}
