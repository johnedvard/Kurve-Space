import Arena from '@colyseus/arena';
import { monitor } from '@colyseus/monitor';

import { BattleRoom } from './rooms/battleRoom';

export default Arena({
  getId: () => 'Kurve Space',

  initializeGameServer: (gameServer) => {
    console.log('process.env.NODE_ENV asd', process.env.NODE_ENV);
    if (process.env.NODE_ENV !== 'production') {
      gameServer.simulateLatency(200);
    }
    /**
     * Define your room handlers:
     */
    gameServer.define('battle', BattleRoom);
  },

  initializeExpress: (app) => {
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
