import { Pool, Sprite } from 'kontra';

export class EngineParticleEffect {
  sprite;
  pool;
  x = 0;
  y = 0;
  dx = 0;
  dy = 0;
  rotation = 0;
  speed = 0.5;
  constructor() {
    this.pool = Pool({
      create: Sprite,
    });
    const kontraSprite = Sprite({
      x: 0,
      y: 0,
      update: (dt) => {
        this.updatePool(dt);
      },
      render: () => {
        this.pool.render();
      },
    });
    this.sprite = kontraSprite;
  }

  coneEffect() {
    return ((1 - Math.random() * 2) / 4) * Math.sign(Math.cos(this.rotation));
  }
  updatePool(dt) {
    this.pool.get({
      x: 0,
      y: 0,
      color: this.sprite.color,
      dx: -Math.cos(this.rotation) * 2 - this.coneEffect(),
      dy: -Math.sin(this.rotation) * 2 + this.coneEffect(),
      ttl: 40,
      render: function () {
        this.context.globalAlpha = this.ttl / 60;
        this.context.fillStyle = this.color;
        this.context.strokeStyle = this.color;
        this.context.fillRect(this.x, this.y, this.ttl / 4, this.ttl / 4);
      },
    });
    this.pool.update();
  }
  render() {
    this.sprite.render();
  }
  update(dt) {
    this.sprite.update(dt);
  }
}
