import {
  init,
  bindKeys,
  initKeys,
  initPointer,
  GameLoop,
  emit,
  on,
} from 'kontra';
import { IGameObject } from './iGameobject';
import { NearConnection } from './near/nearConnection';
import { initLoginLogout } from './near/nearLogin';
import { Player } from './player';
import { Menu } from './menu';
import { GameEvent } from './gameEvent';
import { createColorFromName } from './gameUtils';
import { PlayerState } from './playerState';
import { DeadFeedback } from './deadFeedback';
import { playSong, toggleSond } from './sound';

export class Game {
  canvas;
  ctx;
  x = 10;
  gos = [];
  player;
  menu;
  scale;
  canvasWidth = 800;
  canvasHeight = 600;
  extraPlayerNames = ['e500ff', '814007', '1d34fa'];
  maxPlayers = 4;
  players = [];
  isGameOver = false;
  isGameStarted = false;
  nearConnection;
  constructor(canvas) {
    this.initNear();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scale = 2;
    canvas.width = this.canvasWidth * this.scale;
    canvas.height = this.canvasHeight * this.scale;
    init(canvas);
    initKeys();
    initPointer();
    this.menu = new Menu(this, this.scale);
    this.initLoop();
    this.handleGameInput();
    this.gos.push(new DeadFeedback(this));
    on(GameEvent.startGame, (props) => this.onStartGame(props));
    on(GameEvent.newGame, (props) => this.onNewGame(props));
    window.addEventListener(
      'drand',
      (e) => {
        this.setNewPlayerNames(e.detail);
      },
      false
    );
  }
  setNewPlayerNames(colorNames) {
    colorNames.forEach((cn, index) => {
      this.extraPlayerNames[index] = cn;
    });
  }
  handleGameInput() {
    bindKeys(
      'space',
      (e) => {
        if (this.isGameOver) {
          emit(GameEvent.newGame, {});
        } else if (this.isGameStarted && !this.isGameOver) {
          if (
            this.players.filter((p) => p.playerState === PlayerState.idle)
              .length === this.players.length
          ) {
            emit(GameEvent.startTrace);
          }
        }
      },
      { handler: 'keyup' }
    );
    bindKeys(
      'm',
      (e) => {
        toggleSond();
      },
      { handler: 'keyup' }
    );
  }
  initLoop() {
    this.gos.push(this.menu);

    const loop = new GameLoop({
      update: (dt) => {
        this.gos.forEach((go) => go.update(dt));
        this.checkGameOver();
      },
      render: () => {
        this.gos.forEach((go) => go.render());
      },
    });
    loop.start();
  }
  checkGameOver() {
    const deadPlayers = this.players.filter(
      (p) => p.playerState === PlayerState.dead
    );
    if (this.isGameStarted && deadPlayers.length >= this.players.length - 1) {
      this.isGameOver = true;
      emit(GameEvent.gameOver, {
        winner: this.players.find((p) => p.playerState !== PlayerState.dead),
      });
    }
  }
  initNear() {
    const nearConnection = new NearConnection();
    this.nearConnection = nearConnection;
    nearConnection.initContract().then((res) => {
      initLoginLogout(nearConnection);
    });
  }
  onStartGame(props) {
    this.isGameStarted = true;
    if (this.gos.includes(this.menu)) {
      this.gos.splice(this.gos.indexOf(this.menu), 1);
    }
    [...Array(this.maxPlayers).keys()].forEach((id) => {
      const player = new Player(this, this.scale, {
        color:
          id > 0
            ? '#' + createColorFromName(this.extraPlayerNames[id - 1])
            : '#' + createColorFromName('No_Name'),
        isAi: false,
        spaceShipRenderIndex: props.spaceShipRenderIndices[id],
        playerId: id,
      });
      this.players.push(player);
      this.gos.push(player);
    });
    this.nearConnection
      .getName()
      .then((name) => {
        this.setPlayerColor(name);
      })
      .catch(() => {
        this.setPlayerColor('No_Name');
      });
    playSong();
  }
  setPlayerColor(name) {
    if (this.players && this.players[0]) {
      this.players[0].setColor('#' + createColorFromName(name));
    }
  }
  onNewGame(props) {
    this.isGameOver = false;
    this.players.forEach((p) => {
      p.resetPlayer();
    });
  }
}
