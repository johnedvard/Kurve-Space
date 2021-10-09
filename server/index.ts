import { listen } from '@colyseus/arena';
import arenaConfig from './arena.config';

const port = parseInt(process.env.port, 10) || 3000;

// Create and listen on 2567 (or PORT environment variable.)
listen(arenaConfig);
console.log(`[GameServer] Listening on Port: ${port}`);
