import { Sprite, Vector, on } from 'kontra';
import { BulletState } from './bulletState.js';
import { GameEvent } from './gameEvent.js';
import { isOutOfBounds } from './gameUtils.js';
import { playBulletExplotion } from './sound.js';
import { checkLineIntersection } from './trails.js';

export class Bullet {
  sprite;
  speed = 300;
  prevPoint;
  explotionSize = 40;
  startOffset = 20;
  bulletState = BulletState.idle;
  game;
  constructor(game, { x, y, rotation, color }) {
    this.game = game;
    const bullet = this;
    const kontraSprite = Sprite({
      x: x + Math.cos(rotation) * this.startOffset,
      y: y + Math.sin(rotation) * this.startOffset,
      width: 10,
      height: 10,
      color: color,
      // custom properties
      dx: this.speed,
      dy: this.speed,
      rotation: rotation,
      update: function (dt) {
        if (bullet.bulletState === BulletState.dead) return;
        bullet.prevPoint = Vector(this.x, this.y);
        this.x = this.x + this.dx * dt * Math.cos(this.rotation);
        this.y = this.y + this.dy * dt * Math.sin(this.rotation);
      },
    });
    this.sprite = kontraSprite;
    on(GameEvent.hitTrail, (evt) => this.onBulletHitTrail(evt));
  }
  onBulletHitTrail(evt) {
    if (evt.go === this.sprite) {
      this.bulletState = BulletState.explode;
      playBulletExplotion();
      this.sprite.dx = 0;
      this.sprite.dy = 0;
    }
  }
  update(dt) {
    if (this.bulletState === BulletState.dead) return;
    this.updateDeadBullet();
    this.checkWallHit();
    if (this.prevPoint && this.sprite) {
      checkLineIntersection(this.prevPoint, this.sprite);
    }
    this.sprite.update(dt);
  }
  checkWallHit() {
    if (isOutOfBounds(this.game, this.sprite)) {
      this.bulletState = BulletState.dead;
    }
  }
  updateDeadBullet() {
    if (this.bulletState === BulletState.explode) {
      if (this.sprite.width < this.explotionSize) {
        this.sprite.rotation += 10;
        this.sprite.width += 1;
        this.sprite.height += 1;
      } else {
        this.bulletState = BulletState.dead;
        this.sprite.width = 0;
        this.sprite.height = 0;
      }
    }
  }
  render() {
    if (this.bulletState === BulletState.dead) return;
    this.sprite.render();
  }
}
