import { Socket, io } from 'socket.io-client';
import {logger} from '../e2e/utils/logger'
import { deleteUser, deleteUserQueries } from './utils/user';
import * as fs from 'fs';

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
      logger.logProcess(`User${this.index}`,`: Connected to WebSocket server`);
    });
    this.socket.on('disconnect', (reason) => {
      logger.logProcess(`User${this.index}`,`: ${this.deviceId} - Disconnected from WebSocket server: ${reason}`);
    });
    this.socket.on('error', (error) => {
      logger.logProcess(`User${this.index}`,`: WebSocket error: ${error}`);
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

  async close(finalResult: any = null): Promise<void> {
    if(finalResult) {
      let additionalParams: any = {
        totalTimeTaken: finalResult.userFlows.reduce((sum: number, path: any) => sum + path.totalTimeTaken, 0),
        totalPositiveResponse: finalResult.userFlows.reduce((sum: number, path: any) => sum + path.totalPositveResponse, 0),
        totalNegativeResponse: finalResult.userFlows.reduce((sum: number, path: any) => sum + path.totalNegativeResponse, 0)
      }
      additionalParams['averageTimeTaken'] = additionalParams['totalTimeTaken'] / finalResult.userFlows.length;
      additionalParams['totalTimeTaken'] = `${additionalParams['totalTimeTaken']/1000} sec`
      additionalParams['averageTimeTaken'] = `${additionalParams['averageTimeTaken']/1000} sec`
      finalResult = Object.assign(additionalParams, finalResult);
      const jsonData = JSON.stringify(finalResult, null, 2);
      const filePath = './testResult.json';
      fs.writeFile(filePath, jsonData, (err) => {
          if (err) {
          console.error('Error writing JSON data:', err);
          return;
          }
          console.log('Result written to file:', filePath);
      });
    }
    await deleteUser(this.deviceId)
    await deleteUserQueries(this.deviceId)
    this.socket.close();
  }
}

export default UserSocket;