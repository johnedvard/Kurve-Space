import { emit, on, Vector, bindKeys } from 'kontra';
import { PlayerState } from './playerState.js';
import { GameEvent } from './gameEvent.js';
import { getPlayerControls, getRandomPos, isOutOfBounds } from './gameUtils.js';
import { SpaceShip } from './spaceShip.js';
import { MonetizeEvent } from './monetizeEvent.js';
import { EngineParticleEffect } from './engineParticleEffect.js';
import { addPlayer, checkLineIntersection, playerTrails } from './trails.js';
import { Bullet } from './bullet.js';

class Player {
  sprite;
  spaceShip;
  playerState = PlayerState.idle;
  trails = []; // list of line segments
  ctx;
  speed;
  effect;
  playerId;
  rotating = false;
  maxBullets = 1;
  numBullets = this.maxBullets;
  bullets = [];
  timeToAddTrailInterval = 0.05; //s
  timeSinceLastTrailAdded = 0;
  playerProps;
  scale;
  game;
  constructor(game, scale, playerProps) {
    this.playerProps = playerProps;
    this.scale = scale;
    this.game = game;
    this.playerId = this.playerProps.playerId;
    this.effect = new EngineParticleEffect();
    this.speed = 100 * this.scale;
    this.trails = playerTrails[this.playerProps.playerId];
    this.getEndTrail();
    this.ctx = this.game.ctx;
    const spriteProps = {
      x: playerProps.x,
      y: playerProps.y,
      color: this.playerProps.color || '#000',
    };
    const [leftKey, rightKey, weaponKey] = getPlayerControls(this.playerId);
    this.spaceShip = new SpaceShip(this.playerState, {
      scale: this.scale,
      spriteProps,
      isPreview: false,
      rightKey,
      leftKey,
    });

    bindKeys(
      weaponKey,
      (e) => {
        emit(GameEvent.weaponAttack, {
          sprite: this.spaceShip.sprite,
        });
      },
      { handler: 'keyup' }
    );

    on(GameEvent.weaponAttack, (evt) => this.onPayerAttack(evt));
    on(GameEvent.startTrace, () => this.onStartTrace());
    on(GameEvent.hitTrail, (evt) => this.onHitTrail(evt));
    on(GameEvent.hitWall, (evt) => this.onHitWall(evt));
    on(GameEvent.gameOver, (evt) => this.onGameOver(evt));
    on(MonetizeEvent.progress, this.onMonetizeProgress);

    this.sprite = this.spaceShip.sprite;
    addPlayer(this);
  }
  onPayerAttack(evt) {
    if (
      evt.sprite == this.sprite &&
      this.game.isGameStarted &&
      !this.game.isGameOver &&
      this.numBullets > 0
    ) {
      const x = this.sprite.x;
      const y = this.sprite.y;
      const rotation = this.sprite.rotation;
      const color = this.sprite.color;

      this.bullets.push(new Bullet(this.game, { x, y, rotation, color }));
      --this.numBullets;
    }
  }
  onMonetizeProgress = (evt) => {
    if (
      this.spaceShip.spaceshipIndex !== this.playerProps.spaceShipRenderIndex
    ) {
      this.spaceShip.spaceshipIndex = this.playerProps.spaceShipRenderIndex;
    }
  };
  update(dt) {
    this.addPointToTrail(dt);
    this.sprite.update(dt);
    checkLineIntersection(this.getLastTrailPoint(), this.sprite);
    this.updateEngineEffect(dt);
    this.wallCollision();
    this.updateDeadPlayer();
    this.bullets.forEach((b) => b.update(dt));
  }
  render() {
    this.renderTrail();
    this.sprite.render();
    this.effect.render();
    this.renderDeadPlayer();
    this.bullets.forEach((b) => b.render());
  }
  addPointToTrail(dt) {
    if (this.playerState === PlayerState.tracing) {
      this.timeSinceLastTrailAdded += dt;
      if (this.timeSinceLastTrailAdded >= this.timeToAddTrailInterval) {
        this.getEndTrail().push(Vector(this.sprite.x, this.sprite.y));
        this.timeSinceLastTrailAdded = 0;
      }
    }
  }
  renderTrail() {
    if (this.trails.length) {
      this.ctx.lineWidth = 3 * this.scale;
      this.ctx.beginPath();
      this.trails.forEach((segment, index) => {
        if (!segment || !segment.length) return;
        this.ctx.moveTo(segment[0].x, segment[0].y);
        this.ctx.strokeStyle = this.sprite.color || '#000';
        segment.forEach((t) => {
          this.ctx.lineTo(t.x, t.y);
        });
        this.ctx.stroke();
        // Draw to player head on last segment
        if (
          this.playerState !== PlayerState.dead &&
          index === this.trails.length - 1
        ) {
          this.ctx.lineTo(this.sprite.x, this.sprite.y);
          this.ctx.stroke();
        }
      });
    }
  }
  onStartTrace() {
    this.sprite.dx = this.speed;
    this.sprite.dy = this.speed;
    this.setPlayerState(PlayerState.tracing);
    this.getEndTrail().push(Vector(this.sprite.x, this.sprite.y));
  }
  onHitTrail({ point, go, playerId, trailIndex, segmentIndex }) {
    if (go === this.sprite) {
      this.setPlayerState(PlayerState.dead);
      // finish trail by adding last point
      this.getEndTrail().push(point);
    }
    if (!this.spaceShip.rotating) {
      // Add point to prevent alive player from dying right after being hit, but only if not rotating
      this.getEndTrail().push(Vector(this.sprite.x, this.sprite.y));
    }
    if (playerId === this.playerId) {
      this.splitLineSegment({ segmentIndex, trailIndex });
    }
  }
  splitLineSegment({ segmentIndex, trailIndex }) {
    const orgSegment = [...this.trails[segmentIndex]];
    this.trails[segmentIndex].length = 0;
    const newTrail = [];
    const numPointsToRemove = 3;
    for (let i = 0; i < orgSegment.length; i++) {
      if (i < trailIndex - numPointsToRemove) {
        this.trails[segmentIndex].push(orgSegment[i]);
      } else if (i > trailIndex + numPointsToRemove) {
        newTrail.push(orgSegment[i]);
      }
    }
    this.trails.push(newTrail);
  }
  onGameOver(props) {
    if (props.winner === this) {
      this.setPlayerState(PlayerState.idle);
    }
  }
  onHitWall({ point, go }) {
    if (go === this.sprite) {
      this.setPlayerState(PlayerState.dead);
      // finish trail by adding last point
      this.getEndTrail().push(point);
    }
  }
  wallCollision() {
    if (
      this.playerState === PlayerState.tracing &&
      isOutOfBounds(this.game, this.sprite)
    ) {
      const point = Vector(this.sprite.x, this.sprite.y);
      emit(GameEvent.hitWall, {
        point: point,
        go: this.sprite,
      });
    }
  }
  updateDeadPlayer() {
    if (this.playerState === PlayerState.dead) {
      // TODO create something nice
    }
  }
  renderDeadPlayer() {
    if (this.playerState === PlayerState.dead) {
      // TODO create something nice
    }
  }
  setPlayerState(state) {
    if (this.playerState !== state) {
      this.playerState = state;
      emit(GameEvent.playerStateChange, { state, ship: this.spaceShip });
      if (
        this.playerState === PlayerState.dead ||
        this.playerState === PlayerState.idle
      ) {
        this.sprite.dx = 0;
        this.sprite.dy = 0;
      }
    }
  }
  updateEngineEffect(dt) {
    this.effect.sprite.x = this.sprite.x - 5;
    this.effect.sprite.y = this.sprite.y - 5;
    this.effect.dx = this.sprite.dx;
    this.effect.dy = this.sprite.dy;
    this.effect.rotation = this.sprite.rotation;
    this.effect.sprite.color = this.sprite.color;
    this.effect.update(dt);
  }
  resetPlayer() {
    this.trails.splice(0, this.trails.length, []); // remove all segments

    this.numBullets = this.maxBullets;
    this.setPlayerState(PlayerState.idle);
    this.resetStartPos();
  }
  // The last trail of all line segments
  getEndTrail() {
    return this.trails[this.trails.length - 1];
  }
  getLastTrailPoint() {
    if (this.getEndTrail()) {
      return this.getEndTrail()[this.getEndTrail().length - 1];
    }
  }
  setColor(color) {
    this.sprite.color = color;
    this.spaceShip.sprite.color = color;
  }
  resetStartPos() {
    this.spaceShip.sprite.x = getRandomPos(
      this.game.canvasWidth * this.game.scale
    );
    this.spaceShip.sprite.y = getRandomPos(
      this.game.canvasHeight * this.game.scale
    );
  }
  get x() {
    return this.sprite.x;
  }
  get y() {
    return this.sprite.y;
  }
}
export { Player };
