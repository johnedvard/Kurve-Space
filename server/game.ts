import { ServerEvent } from '../common/serverEvent';
import { BattleRoom } from './battleRoom';
import { Player } from './playerSchema';

export class Game {
  countdownSeconds = 4;
  constructor(private room: BattleRoom) {
    this.startGameCountdown();
    this.room.onMessage(ServerEvent.updatePlayerPos, (client, evt: Player) =>
      this.onUpdatePlayerPos(client, evt)
    );
  }

  startGame() {
    this.room.broadcast(ServerEvent.gameStart, { round: 0 });
  }

  startGameCountdown() {
    let countdown = this.countdownSeconds;
    const startCountdownInterval = setInterval(() => {
      this.room.broadcast(ServerEvent.gameCountodown, countdown--);
      if (countdown === 0) {
        clearInterval(startCountdownInterval);
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
}
