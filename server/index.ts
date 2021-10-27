import { listen } from '@colyseus/arena';
import arenaConfig from './arena.config';

// Create and listen on 2567 (or PORT environment variable.)
listen(arenaConfig);
