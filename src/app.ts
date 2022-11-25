import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';
import welcomeRouter from './routers/welcome';
import apiRouter from './routers';
import errorRequestHandler from './utils/error';
import mongoose from 'mongoose';
import { Server } from 'http';
import { Server as IoServer } from 'socket.io';
import connectionIo from './lib/socket';

function run() {
  // Config Express App
  const app = express();
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.use(bodyParser.json());
  app.use(cors());

  //setup routers
  app.use(welcomeRouter);
  app.use('/api', apiRouter);
  app.use(errorRequestHandler);

  const port = process.env.PORT || 8080;

  mongoose.connect(process.env.MONGODB_URI!, {}, (err) => {
    if (err) {
      throw new Error('Mongodb cannont connect');
    } else {
      const server = new Server(app);
      const io = new IoServer(server, {
        cors: {
          origin: '*',
        },
      });
      io.on<'connection'>('connection', connectionIo);
      server.listen(port, () => {
        console.log(`http://localhost:${port}`);
      });
    }
  });
}

export default run;
