import { on } from 'kontra';
import { GameEvent } from './gameEvent.js';
import { PlayerState } from './playerState.js';
import { playDead } from './sound.js';

export class DeadFeedback {
  isRender = false;
  game;
  constructor(game) {
    this.game = game;
    on(GameEvent.playerStateChange, (evt) => this.onPlayerStateChange(evt));
  }
  onPlayerStateChange(evt) {
    if (evt.state === PlayerState.dead) {
      playDead();
      this.isRender = true;
      setTimeout(() => {
        this.isRender = false;
      }, 90);
    }
  }
  update(dt) {}
  render() {
    if (this.isRender) {
      this.game.ctx.fillStyle = 'gray';
      this.game.ctx.fillRect(
        0,
        0,
        this.game.canvas.width,
        this.game.canvas.height
      );
    }
  }
}
