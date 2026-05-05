import { Container, AnimatedSprite } from 'pixi.js';
import { getFoxIdleTextures, getFoxWinTextures } from '../AssetManifest.js';

export class FoxCharacter extends Container {
  constructor(Assets) {
    super();

    this._idleTextures = getFoxIdleTextures(Assets);
    this._winTextures  = getFoxWinTextures(Assets);

    this._sprite = new AnimatedSprite(this._idleTextures);
    this._sprite.animationSpeed = 0.25;
    this._sprite.anchor.set(0.5, 1);
    this._sprite.play();

    this.addChild(this._sprite);
    this._playing = 'idle';
  }

  playIdle() {
    if (this._playing === 'idle') return;
    this._playing = 'idle';
    this._sprite.textures = this._idleTextures;
    this._sprite.loop = true;
    this._sprite.animationSpeed = 0.25;
    this._sprite.gotoAndPlay(0);
  }

  playWin(onComplete) {
    if (this._playing === 'win') return;
    this._playing = 'win';
    this._sprite.textures = this._winTextures;
    this._sprite.loop = false;
    this._sprite.animationSpeed = 0.3;
    this._sprite.onComplete = () => {
      this.playIdle();
      onComplete?.();
    };
    this._sprite.gotoAndPlay(0);
  }

  get spriteWidth()  { return this._sprite.width; }
  get spriteHeight() { return this._sprite.height; }
}
