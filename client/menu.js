import { Game } from './game.js';
import { IGameObject } from './iGameobject.js';
import { Sprite, emit, on } from 'kontra';
import { createColorFromName, getPlayerControls } from './gameUtils.js';
import { GameEvent } from './gameEvent.js';
import { SpaceShip } from './spaceShip.js';
import { PlayerState } from './playerState.js';
import { MonetizeEvent } from './monetizeEvent.js';

export class Menu {
  sprite;
  spaceShips;
  menuEl;
  spaceDesc;
  userName;
  constructor(game, scale) {
    this.game = game;
    const offset = 130;
    const gap = 355;
    this.spaceShips = [...Array(game.maxPlayers).keys()].map((id) => {
      const spriteProps = {
        x: this.game.canvas.width / 4 + gap * id - offset,
        y: window.innerHeight / 2,
        color:
          id > 0
            ? '#' + createColorFromName(game.extraPlayerNames[id - 1])
            : '',
      };
      const [leftKey, rightKey, weaponKey] = getPlayerControls(id);
      return new SpaceShip(this.game, PlayerState.idle, {
        scale: scale || 1,
        spriteProps: { ...spriteProps },
        isPreview: true,
        leftKey,
        rightKey,
        weaponKey,
      });
    });
    this.menuEl = document.getElementById('menu');

    const nameEl = document.getElementById('name');
    nameEl.addEventListener('keyup', (ev) => this.nameChange(ev));
    this.setUserName(nameEl);

    const startgameEl = document.getElementById('startgame');
    startgameEl.addEventListener('click', (ev) => {
      startgameEl.classList.add('loading');
      startgameEl.innerHTML = 'Loading...';
      startgameEl.setAttribute('disabled', 'true');
      setTimeout(() => {
        // tick to update UI first
        this.game.nearConnection.ready.then(() => {
          this.game.nearConnection.setName(this.userName);
          emit(GameEvent.startGame, {
            spaceShipRenderIndices: this.spaceShips.map((ship) => {
              return ship.spaceshipIndex;
            }),
            userName: this.userName,
          });
          this.menuEl.classList.add('out');
        });
      }, 50);
    });

    this.setSubscriptionTextVisibility(true);
    this.initSpaceshipSelectionUi();
    on(MonetizeEvent.progress, () => this.onMonetizeProgress());
    window.addEventListener(
      'drand',
      (e) => {
        this.setNewPlayerNames(e.detail);
      },
      false
    );
  }
  setNewPlayerNames(colorNames) {
    this.spaceShips.forEach((ship, index) => {
      // ignore player 1
      if (index > 0) {
        ship.sprite.color = '#' + createColorFromName(colorNames[index - 1]);
      }
    });
  }
  initSpaceshipSelectionUi() {
    const arrowGroupEl = document.getElementById('arrowGroup');
    arrowGroupEl.addEventListener('click', (evt) => this.onArrowClicked(evt));
    for (let i = 0; i < this.game.maxPlayers; i++) {
      const leftArrow = document.createElement('button');
      leftArrow.setAttribute('id', 'leftArrow-' + i);
      leftArrow.innerHTML = '<';
      const rightArrow = document.createElement('button');
      rightArrow.setAttribute('id', 'rightArrow-' + i);
      rightArrow.innerHTML = '>';
      arrowGroupEl.appendChild(leftArrow);
      arrowGroupEl.appendChild(rightArrow);
    }
  }
  onArrowClicked(evt) {
    const target = evt.target;
    const idAttr = target.getAttribute('id');
    if (idAttr.match('rightArrow-') || idAttr.match('leftArrow-')) {
      const next = idAttr.match('leftArrow') ? 1 : -1;
      const playerId = parseInt(idAttr.split('-')[1], 10);
      this.selectSpaceShip(playerId, next);
    }
  }
  onMonetizeProgress() {
    this.spaceDesc = this.spaceDesc || document.getElementById('spaceDesc');
    if (!this.spaceDesc.classList.contains('subscriber')) {
      this.spaceDesc.classList.add('subscriber');
      this.spaceDesc.innerHTML =
        'Thanks for being a Coil subscriber  &#128081; You can select any space ship';
    }
  }
  selectSpaceShip(spaceShipId, next) {
    let newSpaceShipIndex = this.spaceShips[spaceShipId].spaceshipIndex + next;
    if (newSpaceShipIndex < 0) {
      newSpaceShipIndex = this.spaceShips[spaceShipId].ships.length - 1;
    } else if (newSpaceShipIndex >= this.spaceShips[spaceShipId].ships.length) {
      newSpaceShipIndex = 0;
    }
    this.spaceShips[spaceShipId].spaceshipIndex = newSpaceShipIndex;
  }
  setSubscriptionTextVisibility(show) {
    this.spaceDesc = this.spaceDesc || document.getElementById('spaceDesc');
    if (show) {
      this.spaceDesc.classList.remove('hide');
    } else {
      this.spaceDesc.classList.add('hide');
    }
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
    this.spaceShips.forEach((ship) => {
      ship.sprite.update(dt);
    });
  }
  render() {
    this.spaceShips.forEach((ship) => {
      ship.sprite.render();
    });
  }
  nameChange(event) {
    this.userName = event.target.value;
    this.setColorFromName(this.userName);
  }
  setColorFromName(name) {
    this.spaceShips[0].sprite.color = '#' + createColorFromName(name);
  }
  async setUserName(nameEl) {
    await this.game.nearConnection.ready;
    this.userName = await this.game.nearConnection.getName();
    nameEl.setAttribute('value', this.userName);
    this.setColorFromName(this.userName);
  }
}
