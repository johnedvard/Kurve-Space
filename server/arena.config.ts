import Arena from '@colyseus/arena';
import { monitor } from '@colyseus/monitor';
import cors from 'cors';
/**
 * Import your Room files
 */
import { BattleRoom } from './battleRoom';

export default Arena({
  getId: () => 'Kurve Space',

  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define('battle', BattleRoom);
  },

  initializeExpress: (app) => {
    app.use(cors());
    /**
     * Bind your custom express routes here:
     */
    app.get('/', (req, res) => {
      res.send("It's time to kick ass and chew bubblegum!");
    });

    /**
     * Bind @colyseus/monitor
     * It is recommended to protect this route with a password.
     * Read more: https://docs.colyseus.io/tools/monitor/
     */
    app.use('/colyseus', monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
