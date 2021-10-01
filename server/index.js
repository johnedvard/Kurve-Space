import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { test } from '../client/myLib.js';
const app = express();
const httpServer = createServer(app);

app.get('/', (req, res) => {
  res.send('asd');
});

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:9000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('coonection');
});

httpServer.listen(3000);
console.log('listen asd', test);
