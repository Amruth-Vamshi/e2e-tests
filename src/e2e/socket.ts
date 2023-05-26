import { Socket, io } from 'socket.io-client';
import {logger} from '../e2e/utils/logger'

class UserSocket {
  private socket: Socket;
  public deviceId: string;
  public index: number;
  public logger: any;

  constructor(apiKey: string, deviceId: string, index: number) {
    this.index = index
    this.deviceId = deviceId
    const socketOptions = {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${apiKey}`,
            channel: 'akai',
          },
        },
      },
      query: {
        deviceId: deviceId,
      },
      autoConnect: false,
      upgrade: false
    };
    this.socket = io(process.env.SOCKET_URL || '', socketOptions);
    this.socket.on('connect', () => {
      logger.logProcess(`User${this.index}`,` - Connected to WebSocket server`);
    });
    this.socket.on('disconnect', (reason) => {
      logger.logProcess(`User${this.index}`,` - Disconnected from WebSocket server: ${reason}`);
    });
    this.socket.on('error', (error) => {
      logger.logProcess(`User${this.index}`,` - WebSocket error: ${error}`);
    });
  }

  connect(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.socket.connect();
      this.socket.on('connect', () => {
        resolve();
      });
    });
  }

  disconnect(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.socket.disconnect();
      this.socket.on('disconnect', () => {
        resolve();
      });
    });
  }

  emitEvent(event: string, data: any): Promise<any> {
    return new Promise<any>((resolve) => {
      this.socket.emit(event, data);
      this.socket.once('botResponse', (response: any) => {
        resolve(response);
      });
    });
  }

  mockEvent(event: string, data: any): Promise<any> {
    return new Promise<any>((resolve) => {
      this.socket.emit(event, data);
      resolve("mock response");
    });
  }

  close(): void {
    this.socket.close();
  }
}

export default UserSocket;