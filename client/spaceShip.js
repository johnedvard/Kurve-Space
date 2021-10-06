import { Sprite, on, keyPressed } from 'kontra';
import { GameEvent } from './gameEvent.js';
import { MonetizeEvent } from './monetizeEvent.js';
import { PlayerState } from './playerState.js';
import { spaceShipRenderers } from './spaceShipRenderers.js';

export class SpaceShip {
  sprite;
  rightKey = 'right';
  leftKey = 'left';
  weaponKey = 'up';
  spaceshipIndex = 0;
  ships = [...spaceShipRenderers];
  rotating = false;
  isSubscriber = false;
  props;
  playerState;
  constructor(playerState, props) {
    this.props = props;
    this.playerState = playerState;
    this.rightKey = props.rightKey || this.rightKey;
    this.leftKey = props.leftKey || this.leftKey;
    this.weaponKey = props.weaponKey || this.weaponKey;
    const spaceShip = this;
    const rotationSpeed = 5;
    const ship = Sprite({
      x: props.spriteProps.x,
      y: props.spriteProps.y,
      color: props.spriteProps.color || '#000',
      width: 15 * props.scale,
      height: 10 * props.scale,
      dx: 0,
      anchor: { x: 0.1, y: 0.5 },
      rotation: -Math.PI / 2,
      render: function () {
        spaceShip.renderSpaceShip(this, spaceShip.isSubscriber);
      },
      update: function (dt) {
        if (keyPressed(spaceShip.leftKey)) {
          this.rotation -= rotationSpeed * dt;
          spaceShip.rotating = true;
        } else if (keyPressed(spaceShip.rightKey)) {
          this.rotation += rotationSpeed * dt;
          spaceShip.rotating = true;
        } else {
          spaceShip.rotating = false;
        }
        // move the ship forward in the direction it's facing
        this.x = this.x + this.dx * dt * Math.cos(this.rotation);
        this.y = this.y + this.dy * dt * Math.sin(this.rotation);
      },
    });
    this.sprite = ship;
    on(GameEvent.playerStateChange, (evt) => this.onPlayerStateChange(evt));
    on(MonetizeEvent.progress, () => this.onMonetizeProgress());
  }
  onMonetizeProgress() {
    this.isSubscriber = true;
  }

  onPlayerStateChange(evt) {
    if (evt.ship === this) {
      this.playerState = evt.state;
    }
  }

  renderSpaceShip(sprite, isSubscriber = false) {
    if (this.playerState !== PlayerState.dead) {
      spaceShipRenderers[0](sprite, isSubscriber);
    }
  }
}
