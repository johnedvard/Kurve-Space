import { on, emit, Button, Grid } from 'kontra';
import { GameEvent } from './gameEvent.js';
import { MonetizeEvent } from './monetizeEvent.js';
import { createColorFromName, getPlayerControls } from './gameUtils.js';
import { SpaceShip } from './spaceShip.js';
import { PlayerState } from './playerState.js';

export class Menu {
  sprite;
  spaceShips;
  menuEl;
  spaceDesc;
  userName;
  grid;
  gos = [];
  constructor(game, scale) {
    this.game = game;
    this.spaceShips = [0].map((id) => {
      const spriteProps = {
        x: this.game.canvas.width / 2,
        y: window.innerHeight / 2,
        color: '#' + createColorFromName('no_name'),
      };
      const [leftKey, rightKey, weaponKey] = getPlayerControls();
      return new SpaceShip(PlayerState.idle, {
        scale: scale || 1,
        spriteProps: { ...spriteProps },
        isPreview: true,
        leftKey,
        rightKey,
        weaponKey,
      });
    });
    this.gos.push(...this.spaceShips);
    this.initGrid(this);
    on(MonetizeEvent.progress, this.onMonetizeProgress);
  }

  initGrid(menu) {
    const startGame = this.initStartGameButton(menu);
    const loginOutBtn = this.initLoginLogoutButton(menu);
    const grid = Grid({
      x: this.game.canvas.width / 2,
      y: this.game.canvas.height - 200,
      anchor: { x: 0.5, y: 0.5 },

      // add 15 pixels of space between each row
      rowGap: 15,

      // center the children
      justify: 'center',

      children: [startGame],
    });
    this.gos.push({ sprite: grid });
  }
  initLoginLogoutButton(menu) {
    const button = Button({
      // sprite properties
      anchor: { x: 0.5, y: 0.5 },

      // text properties
      text: {
        text: 'Login',
        color: 'white',
        font: '40px Arial, sans-serif',
        anchor: { x: 0.5, y: 0.5 },
      },

      // button properties
      padX: 20,
      padY: 10,
    });
    return button;
  }

  initStartGameButton(menu) {
    const button = Button({
      id: 'startGame',
      anchor: { x: 0.5, y: 0.5 },
      text: {
        text: 'Start Game',
        color: 'white',
        font: '40px Arial, sans-serif',
        anchor: { x: 0.5, y: 0.5 },
      },
      padX: 20,
      padY: 10,
      onUp() {
        emit(GameEvent.findGame, {
          spaceShipRenderIndices: menu.spaceShips.map((ship) => {
            return ship.spaceshipIndex;
          }),
          userName: this.userName,
        });
      },
    });
    return button;
  }
  initSpaceshipSelectionUi() {}
  onArrowClicked(evt) {}
  onMonetizeProgress(evt) {}
  selectSpaceShip(spaceShipId, next) {
    let newSpaceShipIndex = this.spaceShips[spaceShipId].spaceshipIndex + next;
    if (newSpaceShipIndex < 0) {
      newSpaceShipIndex = this.spaceShips[spaceShipId].ships.length - 1;
    } else if (newSpaceShipIndex >= this.spaceShips[spaceShipId].ships.length) {
      newSpaceShipIndex = 0;
    }
    this.spaceShips[spaceShipId].spaceshipIndex = newSpaceShipIndex;
  }

  toggleMenu() {
    if (this.menuEl.classList.contains('out')) {
      this.menuEl.classList.add('in');
      this.menuEl.classList.remove('out');
    } else {
      this.menuEl.classList.add('out');
      this.menuEl.classList.remove('in');
    }
  }
  update(dt) {
    this.gos.forEach((go) => {
      if (go.sprite) {
        go.sprite.update(dt);
      }
    });
  }
  render() {
    this.gos.forEach((go) => {
      if (go.sprite) {
        go.sprite.render();
      }
    });
  }
}
