import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { PhaserGame } from '../game/Game.class';

class SocketService {
  public socket: Socket | null = null;

  public connect(url: string): Promise<Socket<DefaultEventsMap, DefaultEventsMap>> {
    return new Promise((rs, rj) => {
      var connectionOptions = {
        timeout: 10000,
        transports: ['websocket', 'polling'],
      };
      this.socket = io(url, connectionOptions);
      if (!this.socket) return rj();
      const game = new PhaserGame().start();

      this.socket.on('connect', () => {
        console.log('connected!');

        rs(this.socket as Socket);
      });

      this.socket.on('connect_error', (err: any) => {
        console.log('Connection error: ', err);
        rj(err);
      });
    });
  }

  public async newPlayer(listners: (data: Array<string>) => void) {
    this.socket?.on('newPlayer', (data) => {
      console.log(data);
      listners(data.rooms);
    });
  }
  public async currentPlayers(listners: (data: Array<string>) => void) {
    this.socket?.on('currentPlayers', (data) => {
      console.log(data);
      listners(data.rooms);
    });
  }
}

export default new SocketService();
