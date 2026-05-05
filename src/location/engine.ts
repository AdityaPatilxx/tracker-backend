import { TagRecord } from '../protocol/types';
import readerConfig from './reader-config.json';

// ─── Tunable constants ────────────────────────────────────────────────────────
const MEASURED_POWER = -50;   // RSSI at 1 metre — calibrate against hardware
const PATH_LOSS_N    = 2.5;   // 2.0 = open space, 3-4 = dense indoor
const SCALE          = 500;   // map units per metre
const MAX_DISTANCE   = 450;   // cap in map units

// Smoothing: EMA alpha — lower = smoother, slower to react
// 0.20 ≈ equivalent to a ~9-sample moving average
const EMA_ALPHA = 0.20;

// Antenna stability: require this many consecutive readings on a new antenna
// before accepting a direction change. 3 readings ≈ 300-450ms at typical packet rate.
// Single transient readings from a wrong antenna are ignored.
const ANTENNA_SWITCH_STREAK = 3;

// Dead zone: if the new computed position is within this many map units of the
// last output, keep the old position — suppresses micro-jitter from RSSI noise.
const DEAD_ZONE = 22;

// ─── Types ────────────────────────────────────────────────────────────────────
interface AntennaConfig { angle: number; beamWidth: number; }
interface ReaderConfig  { x: number; y: number; antennas: Record<string, AntennaConfig>; }

interface TagState {
  rssiEma:        number | null;
  activeAntenna:  number | null;   // currently accepted antenna direction
  streakAntenna:  number | null;   // candidate antenna being evaluated
  streakCount:    number;          // consecutive readings on the candidate
  lastOutput:     { x: number; y: number } | null;
}

const config = readerConfig as Record<string, ReaderConfig>;

class LocationEngine {
  private tagState = new Map<string, TagState>();

  process(deviceId: string, record: TagRecord): { x: number; y: number } | null {
    const reader = config[deviceId];
    if (!reader) return null;

    const state: TagState = this.tagState.get(record.tagId)
      ?? { rssiEma: null, activeAntenna: null, streakAntenna: null, streakCount: 0, lastOutput: null };

    // EMA smoothing of RSSI
    state.rssiEma = state.rssiEma === null
      ? record.rssi
      : EMA_ALPHA * record.rssi + (1 - EMA_ALPHA) * state.rssiEma;

    // Streak-based antenna switching: only accept a new direction after
    // ANTENNA_SWITCH_STREAK consecutive readings on the same new antenna
    const ch = record.antennaChannel;
    if (state.activeAntenna === null) {
      state.activeAntenna = ch;
      state.streakAntenna = ch;
      state.streakCount   = 1;
    } else if (ch === state.activeAntenna) {
      state.streakAntenna = ch;
      state.streakCount   = 1;
    } else if (ch === state.streakAntenna) {
      state.streakCount++;
      if (state.streakCount >= ANTENNA_SWITCH_STREAK) {
        state.activeAntenna = ch;
        state.streakCount   = 1;
      }
    } else {
      state.streakAntenna = ch;
      state.streakCount   = 1;
    }

    const antenna = reader.antennas[String(state.activeAntenna)];
    if (!antenna) { this.tagState.set(record.tagId, state); return null; }

    // Deterministic per-tag spread within ±(beamWidth/4)
    // Keeps tags separated without any random movement between updates
    const spread   = this.tagSpread(record.tagId, antenna.beamWidth);
    const angleRad = ((antenna.angle + spread) * Math.PI) / 180;
    const distance = this.rssiToDistance(state.rssiEma);

    const newX = Math.round(reader.x + distance * Math.cos(angleRad));
    const newY = Math.round(reader.y + distance * Math.sin(angleRad));

    // Dead zone: don't update position if the tag barely moved
    if (state.lastOutput) {
      const dx = newX - state.lastOutput.x;
      const dy = newY - state.lastOutput.y;
      if (Math.sqrt(dx * dx + dy * dy) < DEAD_ZONE) {
        this.tagState.set(record.tagId, state);
        return state.lastOutput;  // return the stable last position
      }
    }

    state.lastOutput = { x: newX, y: newY };
    this.tagState.set(record.tagId, state);
    return state.lastOutput;
  }

  // Stable per-tag angle offset derived from tag ID — same tag always lands
  // in the same spot within the antenna wedge, no random movement
  private tagSpread(tagId: string, beamWidth: number): number {
    let h = 0;
    for (let i = 0; i < tagId.length; i++) h = (h * 31 + tagId.charCodeAt(i)) >>> 0;
    return ((h % 1000) / 1000 - 0.5) * (beamWidth / 2);
  }

  private rssiToDistance(rssi: number): number {
    const metres = Math.pow(10, (MEASURED_POWER - rssi) / (10 * PATH_LOSS_N));
    return Math.min(metres * SCALE, MAX_DISTANCE);
  }
}

export const locationEngine = new LocationEngine();
