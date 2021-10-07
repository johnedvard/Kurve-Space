import * as Colyseus from 'colyseus.js';
import { emit } from 'kontra';
import { ServerEvent } from '../common/serverEvent';
import { GameEvent } from './gameEvent';
import { Player } from './player';
import { createColorFromName } from './gameUtils';
import { BehaviorSubject } from 'rxjs';

export class ServerConnection {
  game;
  otherPlayersSub = new BehaviorSubject([]);
  player1;
  constructor(game, player) {
    this.game = game;
    this.player1 = player;
    console.log('player', this.player1);
    this.connectToServer();
  }
  async connectToServer() {
    this.client = new Colyseus.Client('ws://localhost:3000');
    try {
      this.room = await this.client.joinOrCreate('battle', {
        x: this.player1.x,
        y: this.player1.y,
      });

      this.room.onMessage(
        ServerEvent.gameCountodown,
        this.onGameStartCountdown
      );
      this.room.onMessage(ServerEvent.gameStart, (evt) =>
        this.onGameStart(evt)
      );
      this.room.onMessage(ServerEvent.move, (evt) => this.onMove(evt));
      this.room.onMessage(ServerEvent.playerJoinedRoom, (evt) =>
        this.onPlayerJoinedRoom(evt)
      );
      console.log('joined successfully', this.room);
    } catch (e) {
      console.error('join error', e);
    }
  }

  onMove(evt) {
    console.log('got message from client', message);
  }

  onGameStartCountdown(evt) {
    console.log('countdown', evt);
  }

  onGameStart(evt) {
    console.log('game start', evt);
    emit(GameEvent.startGame, evt);
  }

  onPlayerJoinedRoom(evt) {
    console.log('on player joined room', evt);
    const others = Object.keys(evt.players).flatMap((key) => {
      if (evt.players.hasOwnProperty(key) && key !== this.room.sessionId) {
        const p = evt.players[key];
        const player = new Player(this.game, this.game.scale, {
          color: '#' + createColorFromName(key),
          isAi: false,
          playerId: key,
          isOpponent: true,
          x: p.x,
          y: p.y,
        });
        return player;
      }
      return [];
    });

    this.otherPlayersSub.next([...others]);
  }
}
