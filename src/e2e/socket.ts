import { Socket, io } from 'socket.io-client';

class UserSocket {
  private socket: Socket;
  public deviceId: string;

  constructor(apiKey: string, deviceId: string) {
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
      console.log(deviceId,'- Connected to WebSocket server');
    });
    this.socket.on('disconnect', (reason) => {
      console.log(deviceId,'- Disconnected from WebSocket server:', reason);
    });
    this.socket.on('error', (error) => {
      console.error(deviceId,'- WebSocket error:', error);
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