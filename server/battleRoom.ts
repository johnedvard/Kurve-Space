import { Room } from 'colyseus';
import { Schema, MapSchema, type } from '@colyseus/schema';
import { ServerEvent } from '../common/serverEvent';
import { Player } from './playerSchema';
import { Game } from './game';

// Our custom game state, an ArraySchema of type Player only at the moment
export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();
}

export class BattleRoom extends Room {
  maxClients = 2;
  onCreate(options) {
    console.log('on create');
    this.setState(new State());
  }

  onJoin(client, { x, y, rotation }: Player) {
    console.log('on join', x, y);
    this.state.players.set(client.sessionId, new Player({ x, y, rotation }));
    this.broadcast(ServerEvent.playerJoinedRoom, {
      players: this.state.players,
    });
    if (this.state.players.size === this.maxClients) {
      new Game(this);
    }
  }

  onLeave(client, options) {
    console.log('client left');
    this.state.players.delete(client.sessionId);
  }

  updatePlayer(client, player: Player) {
    const currPlayer = this.state.players.get(client.sessionId);
    currPlayer.x = player.x;
    currPlayer.x = player.y;
    currPlayer.x = player.rotation;
    this.state.players.set(client.sessionId, currPlayer);
  }
}
