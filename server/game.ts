import { ServerEvent } from '../common/serverEvent';
import { BattleRoom } from './battleRoom';

export class Game {
  countdownSeconds = 4;
  constructor(private room: BattleRoom) {
    this.startGameCountdown();
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
}
