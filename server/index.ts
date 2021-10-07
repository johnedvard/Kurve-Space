import { Server } from 'colyseus';
import { BattleRoom } from './battleRoom';

const port = parseInt(process.env.port, 10) || 3000;

const gameServer = new Server();
gameServer.define('battle', BattleRoom);
gameServer.listen(port);
console.log(`[GameServer] Listening on Port: ${port}`);
