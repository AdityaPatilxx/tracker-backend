// ─── Parsed Packet ────────────────────────────────────────────────────────────
export interface ParsedPacket {
  raw:      Buffer;
  len:      number;       // from header (excludes start flag + crc)
  cmd:      number;
  seq:      number;
  version:  number;
  secFlag:  number;
  deviceId: string;       // 15-char ASCII, null-stripped
  payload:  Buffer;       // service content bytes
}

// ─── Device State ─────────────────────────────────────────────────────────────
export type DeviceConnectionState =
  | 'unregistered'
  | 'registered'
  | 'logged-in';

export interface DeviceState {
  deviceId:        string;
  connectionState: DeviceConnectionState;
  seq:             number;             // last received sequence number
  lastHeartbeat:   Date | null;
  firmwareVersion: string | null;      // e.g. "2.7"
  configCrc:       number | null;
  ipAddress:       string;
}

// ─── Tag Data ─────────────────────────────────────────────────────────────────
export interface TagRecord {
  tlvType:        number;
  antennaChannel: number;    // 1–4
  isEntering:     boolean;   // true = entering range, false = leaving
  isBaseStation:  boolean;
  tagType:        number;
  tagId:          string;    // hex string e.g. "E3AF2232"
  checksum:       number;
  exciAddress:    number;
  voltageAlarm:   boolean;
  rssi:           number;    // signed dBm e.g. -78
  eventTime:      Date;
}

// ─── Heartbeat Data ───────────────────────────────────────────────────────────
export interface HeartbeatData {
  workStatus:      number;
  gprsConnected:   boolean;
  lanConnected:    boolean;
  tagReportEnabled: boolean;
  powerFailed:     boolean;
  batteryLevel:    number;   // 0–10, 10 = 100%
  signalStrength:  number;   // 0–31 or 99
  firmwareVersion: string;
  deviceTime:      Date;
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────
export type WsEventType =
  | 'tag:update'
  | 'device:online'
  | 'device:offline'
  | 'device:heartbeat';

export interface WsEvent<T = unknown> {
  type:      WsEventType;
  deviceId:  string;
  timestamp: string;
  data:      T;
}

export interface TagUpdateEvent {
  tagId:          string;
  tagType:        number;
  antennaChannel: number;
  rssi:           number;
  isEntering:     boolean;
  eventTime:      string;
  position?:      { x: number; y: number };
}
