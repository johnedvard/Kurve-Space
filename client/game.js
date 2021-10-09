import {
  init,
  bindKeys,
  initKeys,
  initPointer,
  GameLoop,
  emit,
  on,
} from 'kontra';
import { NearConnection } from './near/nearConnection.js';
import { initLoginLogout } from './near/nearLogin.js';
import { Player } from './player.js';
import { Menu } from './menu.js';
import { GameEvent } from './gameEvent.js';
import { createColorFromName, getRandomPos } from './gameUtils.js';
import { PlayerState } from './playerState.js';
import { DeadFeedback } from './deadFeedback.js';
import { playSong, toggleSound } from './sound.js';
import { ServerConnection } from './serverConnection.js';

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
  players = [];
  isGameOver = false;
  isGameStarted = false;
  nearConnection;
  client;
  room;
  serverConnection;
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
    on(GameEvent.findGame, (props) => this.onFindGame(props));
    on(GameEvent.startGame, (props) => this.onStartGame(props));
    on(GameEvent.newGame, (props) => this.onNewGame(props));
  }

  handleGameInput() {
    // bindKeys(
    //   'space',
    //   (e) => {
    //     if (this.isGameOver) {
    //       emit(GameEvent.newGame, {});
    //     } else if (this.isGameStarted && !this.isGameOver) {
    //       if (
    //         this.players.filter((p) => p.playerState === PlayerState.idle)
    //           .length === this.players.length
    //       ) {
    //         emit(GameEvent.startTrace);
    //       }
    //     }
    //   },
    //   { handler: 'keyup' }
    // );
    bindKeys(
      'm',
      (e) => {
        toggleSound();
      },
      { handler: 'keyup' }
    );
  }
  initLoop() {
    this.gos.push(this.menu);

    const loop = new GameLoop({
      update: (dt) => {
        this.gos.forEach((go) => go.update(dt));
        this.players.forEach((go) => go.update(dt));
        if (this.serverConnection) {
          this.serverConnection.updatePlayerPos(this.player);
        }
        this.checkGameOver();
      },
      render: () => {
        this.gos.forEach((go) => go.render());
        this.players.forEach((go) => go.render());
      },
      blur: true,
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
  onFindGame(props) {
    if (this.gos.includes(this.menu)) {
      this.gos.splice(this.gos.indexOf(this.menu), 1);
    }
    const player = new Player(this, this.scale, {
      color: '#' + createColorFromName('No_Name'),
      isAi: false,
      spaceShipRenderIndex: props.spaceShipRenderIndices[0],
      playerId: 'player1',
      isOpponent: false,
      x: getRandomPos(this.canvasWidth * this.scale),
      y: getRandomPos(this.canvasHeight * this.scale),
    });
    this.player = player;
    this.players.push(player);
    playSong(true); // load assets
    this.serverConnection = new ServerConnection(this, player);
    this.serverConnection.otherPlayersSub.subscribe((otherPlayers) => {
      this.players = [player, ...otherPlayers];
    });
  }
  onStartGame() {
    console.log('client start game');
    emit(GameEvent.startTrace);
    this.serverConnection.playerPosUpdateSub.subscribe((player) => {
      const playerToUpdate = this.players.find(
        (p) => p.playerId === player.playerId
      );
      if (playerToUpdate) {
        playerToUpdate.rotation = player.rotation;
        playerToUpdate.x = player.x;
        playerToUpdate.y = player.y;
      }
    });
    this.isGameStarted = true;
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
