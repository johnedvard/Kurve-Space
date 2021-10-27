import { getRandomPlayerPos } from '../common/commonUtils';
import { ServerEvent } from '../common/serverEvent';
import { BattleRoom } from './battleRoom';
import { Player } from './playerSchema';

export class Game {
  countdownSeconds = 4;
  killedPlayers = 0;
  round = 0;

  scale = 2;
  canvasWidth = 800;
  canvasHeight = 600;
  constructor(private room: BattleRoom) {
    room.clock.start();
    this.startGameCountdown();
    this.room.onMessage(ServerEvent.updatePlayerPos, (client, player: Player) =>
      this.onUpdatePlayerPos(client, player)
    );
    this.room.onMessage(ServerEvent.gameOver, (client, winner: Player) =>
      this.onGameOver(client, winner)
    );
  }

  startGame() {
    this.room.broadcast(ServerEvent.gameStart, { round: 0 });
  }

  startNewGame() {
    this.killedPlayers = 0;
    const scale = this.scale;
    const canvasWidth = this.canvasWidth;
    const canvasHeight = this.canvasHeight;
    const round = ++this.round;
    const playersPos = {};
    this.room.clients.forEach((client) => {
      playersPos[client.sessionId] = {
        pos: getRandomPlayerPos({ canvasHeight, canvasWidth, scale }),
      };
    });
    console.log('playersPos', playersPos);
    this.room.broadcast(ServerEvent.gameStart, { round, playersPos });
    this.startGameCountdown();
  }

  startGameCountdown() {
    let countdown = this.countdownSeconds;
    const startCountdownInterval = this.room.clock.setInterval(() => {
      this.room.broadcast(ServerEvent.gameCountodown, countdown--);
      if (countdown === 0) {
        startCountdownInterval.clear();
        this.startGame();
      }
    }, 1000);
  }

  onUpdatePlayerPos(client, player: Player) {
    this.room.updatePlayer(client, player);
    player.playerId = client.sessionId;
    this.room.broadcast(ServerEvent.updatePlayerPos, player, {
      except: client,
    });
  }

  onGameOver(client, winner: Player) {
    console.log('winner is', winner);
    console.log('Start new game countdown');
    console.log('this.killedPlayers', this.killedPlayers);
    if (++this.killedPlayers === this.room.maxClients) {
      this.startNewGame();
    }
  }
}
