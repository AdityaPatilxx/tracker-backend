import net from 'net';
import { DeviceState } from '../protocol/types';

export class DeviceManager {
  private static instance: DeviceManager;
  
  private states = new Map<string, DeviceState>();
  private sockets = new Map<string, net.Socket>();
  private addressToDevice = new Map<string, string>();

  private constructor() {}

  public static getInstance(): DeviceManager {
    if (!DeviceManager.instance) {
      DeviceManager.instance = new DeviceManager();
    }
    return DeviceManager.instance;
  }

  public registerSocket(deviceId: string, socket: net.Socket): void {
    if (!this.states.has(deviceId)) {
      this.states.set(deviceId, {
        deviceId,
        connectionState: 'unregistered',
        seq: 0,
        lastHeartbeat: null,
        firmwareVersion: null,
        configCrc: null,
        ipAddress: socket.remoteAddress || '',
      });
    }
    
    this.sockets.set(deviceId, socket);
    const key = `${socket.remoteAddress}:${socket.remotePort}`;
    this.addressToDevice.set(key, deviceId);
  }

  public getDeviceBySocket(socket: net.Socket): DeviceState | undefined {
    const key = `${socket.remoteAddress}:${socket.remotePort}`;
    const deviceId = this.addressToDevice.get(key);
    if (deviceId) {
      return this.states.get(deviceId);
    }
    return undefined;
  }

  public getSocket(deviceId: string): net.Socket | undefined {
    return this.sockets.get(deviceId);
  }

  public updateState(deviceId: string, partial: Partial<DeviceState>): void {
    const state = this.states.get(deviceId);
    if (state) {
      Object.assign(state, partial);
    }
  }

  public removeSocket(socket: net.Socket): void {
    const key = `${socket.remoteAddress}:${socket.remotePort}`;
    const deviceId = this.addressToDevice.get(key);
    if (deviceId) {
      this.sockets.delete(deviceId);
      this.addressToDevice.delete(key);
      const state = this.states.get(deviceId);
      if (state) {
        state.connectionState = 'unregistered';
      }
    }
  }
}

export const deviceManager = DeviceManager.getInstance();
