export interface ParsedPacket {
    raw: Buffer;
    len: number;
    cmd: number;
    seq: number;
    version: number;
    secFlag: number;
    deviceId: string;
    payload: Buffer;
}
export type DeviceConnectionState = 'unregistered' | 'registered' | 'logged-in';
export interface DeviceState {
    deviceId: string;
    connectionState: DeviceConnectionState;
    seq: number;
    lastHeartbeat: Date | null;
    firmwareVersion: string | null;
    configCrc: number | null;
    ipAddress: string;
}
export interface TagRecord {
    tlvType: number;
    antennaChannel: number;
    isEntering: boolean;
    isBaseStation: boolean;
    tagType: number;
    tagId: string;
    checksum: number;
    exciAddress: number;
    voltageAlarm: boolean;
    rssi: number;
    eventTime: Date;
}
export interface HeartbeatData {
    workStatus: number;
    gprsConnected: boolean;
    lanConnected: boolean;
    tagReportEnabled: boolean;
    powerFailed: boolean;
    batteryLevel: number;
    signalStrength: number;
    firmwareVersion: string;
    deviceTime: Date;
}
export type WsEventType = 'tag:update' | 'device:online' | 'device:offline' | 'device:heartbeat';
export interface WsEvent<T = unknown> {
    type: WsEventType;
    deviceId: string;
    timestamp: string;
    data: T;
}
export interface TagUpdateEvent {
    tagId: string;
    tagType: number;
    antennaChannel: number;
    rssi: number;
    isEntering: boolean;
    eventTime: string;
    position?: {
        x: number;
        y: number;
    };
}
//# sourceMappingURL=types.d.ts.map