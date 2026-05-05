import { Container, Sprite, Graphics, Text, Assets } from 'pixi.js';
import {
  GAME_WIDTH, GAME_HEIGHT,
  FRAME_X, FRAME_Y, FRAME_W, FRAME_H,
  GRID_X, GRID_Y, REEL_COLS, REEL_ROWS, CELL_W, CELL_H,
} from '../config.js';
import { ReelGrid } from '../components/ReelGrid.js';
import { FoxCharacter } from '../components/FoxCharacter.js';
import { UIBar } from '../components/UIBar.js';
import { WinPopup } from '../components/WinPopup.js';

const HEADER_STYLE = {
  fontFamily: 'Arial Black, Impact, sans-serif',
  fontSize: 24,
  fill: 0xffd700,
  fontWeight: 'bold',
  dropShadow: { color: 0x000000, blur: 4, distance: 2 },
  stroke: { color: 0x5c2800, width: 4 },
};

export class GameScene extends Container {
  constructor(app) {
    super();
    this._app = app;

    this._build();
    app.ticker.add(this._tick, this);
  }

  _build() {
    this._buildBackground();
    this._buildSlotFrame();
    this._buildGrid();
    this._buildFox();
    this._buildHeader();
    this._buildUI();
    this._buildWinPopup();
  }

  _buildBackground() {
    const bg = Sprite.from('bg_preloader');
    bg.width = GAME_WIDTH;
    bg.height = GAME_HEIGHT;
    // Slightly darken center where slot machine sits
    this.addChild(bg);

    const dim = new Graphics();
    dim.rect(FRAME_X - 5, FRAME_Y - 5, FRAME_W + 10, FRAME_H + 10);
    dim.fill({ color: 0x000000, alpha: 0.45 });
    this.addChild(dim);
  }

  _buildSlotFrame() {
    // Outer metallic border
    const outer = new Graphics();
    outer.roundRect(FRAME_X - 14, FRAME_Y - 14, FRAME_W + 28, FRAME_H + 28, 12);
    outer.fill({ color: 0x555555 });
    outer.stroke({ width: 4, color: 0x888888 });
    this.addChild(outer);

    // Inner dark recess
    const inner = new Graphics();
    inner.roundRect(FRAME_X - 6, FRAME_Y - 6, FRAME_W + 12, FRAME_H + 12, 8);
    inner.fill({ color: 0x1a1a1a });
    inner.stroke({ width: 3, color: 0x333333 });
    this.addChild(inner);

    // Bolts / corner rivets
    const boltPositions = [
      [FRAME_X - 10, FRAME_Y - 10],
      [FRAME_X + FRAME_W + 10, FRAME_Y - 10],
      [FRAME_X - 10, FRAME_Y + FRAME_H + 10],
      [FRAME_X + FRAME_W + 10, FRAME_Y + FRAME_H + 10],
    ];
    for (const [bx, by] of boltPositions) {
      const bolt = new Graphics();
      bolt.circle(bx, by, 8);
      bolt.fill({ color: 0x888888 });
      bolt.stroke({ width: 2, color: 0xaaaaaa });
      this.addChild(bolt);
    }
  }

  _buildGrid() {
    this._reelGrid = new ReelGrid(Assets);
    this._reelGrid.x = GRID_X;
    this._reelGrid.y = GRID_Y;
    this.addChild(this._reelGrid);
  }

  _buildFox() {
    this._fox = new FoxCharacter(Assets);
    // Fox frame: 425×582 px. Position to right of slot frame (right edge x=816)
    // Scale so fox height ≈ slot frame height (400px), anchor bottom-center
    const scale = 0.50;
    this._fox.scale.set(scale);
    // Center of fox: halfway into the right strip, slightly past slot frame edge
    this._fox.x = FRAME_X + FRAME_W + 72;   // ≈ x=888
    this._fox.y = FRAME_Y + FRAME_H + 2;     // feet at bottom of slot frame
    this.addChild(this._fox);
  }

  _buildHeader() {
    // Header banner above the slot frame
    const banner = new Graphics();
    banner.roundRect(FRAME_X + 40, FRAME_Y - 50, FRAME_W - 80, 52, 10);
    banner.fill({ color: 0x1a0a00 });
    banner.stroke({ width: 3, color: 0x8b6914 });
    this.addChild(banner);

    const title = new Text({ text: 'BANK ROBBERY SLOT', style: HEADER_STYLE });
    title.anchor.set(0.5);
    title.x = FRAME_X + FRAME_W / 2;
    title.y = FRAME_Y - 25;
    this.addChild(title);
  }

  _buildUI() {
    this._uiBar = new UIBar();
    this.addChild(this._uiBar);

    this._uiBar.onSpin(() => this._startSpin());
  }

  _buildWinPopup() {
    this._winPopup = new WinPopup();
    this.addChild(this._winPopup);
  }

  async _startSpin() {
    if (this._reelGrid.isSpinning) return;

    this._uiBar.setSpinEnabled(false);
    this._uiBar.deductBet();

    const results = await this._spinPromise();

    const { win, amount } = this._reelGrid.evaluateWin(results, this._uiBar.bet);

    if (win) {
      this._uiBar.addWin(amount);
      this._fox.playWin(() => this._fox.playIdle());
      this._winPopup.show(amount, () => {
        this._uiBar.setSpinEnabled(true);
      });
    } else {
      this._uiBar.setSpinEnabled(true);
    }
  }

  _spinPromise() {
    return this._reelGrid.spin();
  }

  _tick = () => {
    this._reelGrid.tick();
  };

  destroy(opts) {
    this._app.ticker.remove(this._tick, this);
    super.destroy(opts);
  }
}
