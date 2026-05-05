import { Container, Graphics, Text } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, INITIAL_BALANCE, INITIAL_BET } from '../config.js';

const BAR_H = 88;
const BAR_Y = GAME_HEIGHT - BAR_H;

// Labels above the panels (BALANCE / WIN / BET)
const LABEL_STYLE = {
  fontFamily: 'Arial Black, Impact, sans-serif',
  fontSize: 12,
  fill: 0xffa500,
  fontWeight: 'bold',
  letterSpacing: 2,
};

// Values inside the metallic panels
const GREEN_VAL = {
  fontFamily: 'Arial Black, Impact, sans-serif',
  fontSize: 20,
  fill: 0x33ff33,
  fontWeight: 'bold',
};

const GOLD_VAL = {
  fontFamily: 'Arial Black, Impact, sans-serif',
  fontSize: 20,
  fill: 0xffd700,
  fontWeight: 'bold',
};

const SPIN_STYLE = {
  fontFamily: 'Arial Black, Impact, sans-serif',
  fontSize: 13,
  fill: 0xffffff,
  fontWeight: 'bold',
  letterSpacing: 1,
};

// Layout constants — panels start lower so labels never overlap borders
const LABEL_Y  = 6;    // top of bar → label top
const PANEL_Y  = 24;   // panel top (below label)
const PANEL_H  = 54;   // panel height
const VAL_Y    = PANEL_Y + PANEL_H / 2 + 2; // value center inside panel

export class UIBar extends Container {
  constructor() {
    super();
    this.y = BAR_Y;
    this._balance = INITIAL_BALANCE;
    this._bet     = INITIAL_BET;
    this._win     = 0;
    this._onSpin  = null;
    this._spinEnabled = true;
    this._build();
  }

  _build() {
    // 1. Background
    const bg = new Graphics();
    bg.rect(0, 0, GAME_WIDTH, BAR_H);
    bg.fill({ color: 0x0d0d0d });
    this.addChild(bg);

    // Top separator
    const sep = new Graphics();
    sep.rect(0, 0, GAME_WIDTH, 2);
    sep.fill({ color: 0x444444 });
    this.addChild(sep);

    // 2. Panels — added BEFORE labels so labels render on top
    const balPanel = this._makePanel(16, PANEL_Y, 162, PANEL_H);
    const winPanel = this._makePanel(196, PANEL_Y, 272, PANEL_H);
    const betPanel = this._makePanel(487, PANEL_Y, 146, PANEL_H);
    this.addChild(balPanel);
    this.addChild(winPanel);
    this.addChild(betPanel);

    // 3. Labels (rendered ON TOP of panels — no overlap because LABEL_Y < PANEL_Y)
    this._addLabel('BALANCE', 16 + 81,  LABEL_Y);
    this._addLabel('WIN',     196 + 136, LABEL_Y);
    this._addLabel('BET',     487 + 73,  LABEL_Y);

    // 4. Values (inside panels, centered)
    this._balanceLbl = this._addText(`$ ${this._balance.toLocaleString()}`, 16 + 81,  VAL_Y, GOLD_VAL);
    this._winText    = this._addText('$ 0',                                  196 + 136, VAL_Y, GREEN_VAL);
    this._betText    = this._addText(`$ ${this._bet.toLocaleString()}`,      487 + 73,  VAL_Y, GREEN_VAL);

    this._winCX = 196 + 136;
    this._betCX = 487 + 73;

    // 5. Buttons
    this._buildGreenButton(662, 45, 'arrow-down',  () => this._changeBet(-50));
    this._buildSpinButton( 755, 44);
    this._buildGreenButton(848, 45, 'arrow-cycle', () => {});
  }

  // ── Metallic panel (returns Container, caller does addChild) ─────
  _makePanel(x, y, w, h) {
    const c = new Container();
    c.x = x;
    c.y = y;

    // Silver outer border
    const outer = new Graphics();
    outer.roundRect(0, 0, w, h, 8);
    outer.fill({ color: 0x999999 });
    c.addChild(outer);

    // Dark bevel
    const bevel = new Graphics();
    bevel.roundRect(2, 2, w - 4, h - 4, 7);
    bevel.fill({ color: 0x444444 });
    c.addChild(bevel);

    // Dark interior
    const inner = new Graphics();
    inner.roundRect(3, 3, w - 6, h - 6, 6);
    inner.fill({ color: 0x111111 });
    c.addChild(inner);

    // Rivets
    this._rivet(c, 10,     h / 2);
    this._rivet(c, w - 10, h / 2);

    return c;
  }

  _rivet(parent, lx, ly) {
    const g = new Graphics();
    g.circle(lx, ly, 5);
    g.fill({ color: 0xaaaaaa });
    g.circle(lx - 1.5, ly - 1.5, 2);
    g.fill({ color: 0xdddddd, alpha: 0.8 });
    parent.addChild(g);
  }

  _addLabel(text, cx, y) {
    const t = new Text({ text, style: LABEL_STYLE });
    t.anchor.set(0.5, 0);
    t.x = cx;
    t.y = y;
    this.addChild(t);
    return t;
  }

  _addText(text, cx, cy, style) {
    const t = new Text({ text, style });
    t.anchor.set(0.5, 0.5);
    t.x = cx;
    t.y = cy;
    this.addChild(t);
    return t;
  }

  // ── Green button ─────────────────────────────────────────────────
  _buildGreenButton(cx, cy, iconType, onClick) {
    const R   = 24;
    const btn = new Container();
    btn.x = cx;
    btn.y = cy;
    this.addChild(btn);

    const glow = new Graphics();
    glow.circle(0, 0, R + 4);
    glow.fill({ color: 0x003300, alpha: 0.6 });
    btn.addChild(glow);

    const body = new Graphics();
    body.circle(0, 0, R);
    body.fill({ color: 0x228822 });
    btn.addChild(body);

    const shine = new Graphics();
    shine.ellipse(-2, -8, R * 0.5, R * 0.27);
    shine.fill({ color: 0x55dd55, alpha: 0.5 });
    btn.addChild(shine);

    btn.addChild(this._makeIcon(iconType));

    const hit = new Graphics();
    hit.circle(0, 0, R + 4);
    hit.fill({ color: 0xffffff, alpha: 0.001 });
    hit.eventMode = 'static';
    hit.cursor = 'pointer';
    hit.on('pointerdown',     () => { btn.scale.set(0.9); onClick(); });
    hit.on('pointerup',       () => btn.scale.set(1));
    hit.on('pointerupoutside',() => btn.scale.set(1));
    btn.addChild(hit);
    return btn;
  }

  _makeIcon(type) {
    const g = new Graphics();
    if (type === 'arrow-down') {
      g.poly([-9, -4, 9, -4, 0, 7]);
      g.fill({ color: 0xffffff, alpha: 0.9 });
    } else {
      g.arc(0, 0, 10, -Math.PI * 0.75, Math.PI * 0.75);
      g.stroke({ width: 3, color: 0xffffff });
      g.poly([7, -10, 13, -3, 2, -3]);
      g.fill({ color: 0xffffff });
    }
    return g;
  }

  // ── SPIN button ──────────────────────────────────────────────────
  _buildSpinButton(cx, cy) {
    const R = 36;
    this._spinCont = new Container();
    this._spinCont.x = cx;
    this._spinCont.y = cy;
    this.addChild(this._spinCont);

    const ring = new Graphics();
    ring.circle(0, 0, R + 7);
    ring.fill({ color: 0x330000 });
    this._spinCont.addChild(ring);

    const body = new Graphics();
    body.circle(0, 0, R);
    body.fill({ color: 0xcc1111 });
    this._spinCont.addChild(body);
    this._spinBody = body;

    const shine = new Graphics();
    shine.ellipse(-5, -13, R * 0.52, R * 0.32);
    shine.fill({ color: 0xff6666, alpha: 0.55 });
    this._spinCont.addChild(shine);

    const lbl = new Text({ text: 'SPIN', style: SPIN_STYLE });
    lbl.anchor.set(0.5);
    this._spinCont.addChild(lbl);

    const hit = new Graphics();
    hit.circle(0, 0, R + 7);
    hit.fill({ color: 0xffffff, alpha: 0.001 });
    hit.eventMode = 'static';
    hit.cursor = 'pointer';
    hit.on('pointerdown',     () => this._onSpinPress());
    hit.on('pointerup',       () => this._onSpinRelease());
    hit.on('pointerupoutside',() => this._onSpinRelease());
    hit.on('pointerover',     () => { if (this._spinEnabled) body.tint = 0xff4444; });
    hit.on('pointerout',      () => { body.tint = 0xffffff; });
    this._spinCont.addChild(hit);
  }

  _onSpinPress()   { if (!this._spinEnabled) return; this._spinCont.scale.set(0.9); this._onSpin?.(); }
  _onSpinRelease() { this._spinCont.scale.set(1); }

  // ── Public API ────────────────────────────────────────────────────
  onSpin(fn) { this._onSpin = fn; }

  setSpinEnabled(en) {
    this._spinEnabled = en;
    this._spinCont.alpha = en ? 1 : 0.45;
  }

  _changeBet(delta) {
    this._bet = Math.max(50, Math.min(500, this._bet + delta));
    this._betText.text = `$ ${this._bet.toLocaleString()}`;
  }

  deductBet() {
    this._balance -= this._bet;
    this._win = 0;
    this._balanceLbl.text = `$ ${this._balance.toLocaleString()}`;
    this._winText.text    = '$ 0';
  }

  addWin(amount) {
    this._balance += amount;
    this._win = amount;
    this._balanceLbl.text = `$ ${this._balance.toLocaleString()}`;
    this._winText.text    = `$ ${amount.toLocaleString()}`;
  }

  get bet()     { return this._bet; }
  get balance() { return this._balance; }
}
