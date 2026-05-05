# Location Engine

`src/location/engine.ts` — transforms raw `TagRecord` data into `{x, y}` map coordinates.

## Hardware Context

One reader box (`260329101000085`) with 4 antennas facing different cardinal directions. All antennas share the same physical position — trilateration is not possible. Position is estimated using **polar sector + RSSI distance**.

Confirmed antenna directions:

| Channel | Direction | Angle |
|---------|-----------|-------|
| 1 | East | 0° |
| 2 | South | 90° |
| 3 | West | 180° |
| 4 | North | 270° |

Angles follow canvas math convention: 0° = right (+X), 90° = down (+Y, South on screen).

## Reader Configuration

`src/location/reader-config.json` — keyed by device ID:

```json
{
  "260329101000085": {
    "x": 500,
    "y": 500,
    "antennas": {
      "1": { "angle": 0,   "beamWidth": 90 },
      "2": { "angle": 90,  "beamWidth": 90 },
      "3": { "angle": 180, "beamWidth": 90 },
      "4": { "angle": 270, "beamWidth": 90 }
    }
  }
}
```

Map space is 1000 × 1000 units. Reader is at (500, 500) — centre.

## Algorithm (current implementation)

For each incoming `TagRecord`, the engine runs four steps:

### 1. RSSI Smoothing — Exponential Moving Average (EMA)

```
rssiEma = EMA_ALPHA × rssi + (1 − EMA_ALPHA) × previous_rssiEma
```

`EMA_ALPHA = 0.20` (≈ 9-sample equivalent). Weights recent readings more than a plain average, damps transient noise spikes without lagging behind genuine RSSI changes.

### 2. Antenna Direction — Streak Confirmation

Raw antenna readings flicker between antennas even for stationary tags. A direction change is only accepted after `ANTENNA_SWITCH_STREAK = 3` consecutive readings on the same new antenna (~300–450 ms at typical packet rate).

```
state: activeAntenna, streakAntenna, streakCount

on each reading (channel ch):
  if ch == activeAntenna  →  reset streak, keep direction
  if ch == streakAntenna  →  streakCount++
    if streakCount >= 3   →  accept: activeAntenna = ch
  else                    →  new candidate: streakAntenna = ch, streakCount = 1
```

### 3. Distance Estimation — Log-Distance Path Loss

```
distance_metres = 10 ^ ((MEASURED_POWER − rssiEma) / (10 × PATH_LOSS_N))
distance_map    = min(distance_metres × SCALE, MAX_DISTANCE)
```

Then convert polar → cartesian:

```
tag_x = reader_x + distance_map × cos(antenna_angle + tag_spread)
tag_y = reader_y + distance_map × sin(antenna_angle + tag_spread)
```

`tag_spread` is a **deterministic** per-tag offset (derived from tag ID hash) within `±(beamWidth / 4)`. This keeps distinct tags from stacking at the same pixel without introducing any random movement.

### 4. Dead Zone

If the new computed position is within `DEAD_ZONE = 22` map units of the last emitted position, the engine returns the old position unchanged. Stationary tags lock in place; only genuine movement larger than the dead zone threshold triggers an update.

## Tunable Constants

| Constant | Value | Effect of increasing |
|----------|-------|---------------------|
| `MEASURED_POWER` | -50 dBm | Calibration: RSSI at exactly 1 metre. Set by measuring real hardware |
| `PATH_LOSS_N` | 2.5 | Higher = signal drops faster with distance → tags appear closer |
| `EMA_ALPHA` | 0.20 | Higher = reacts faster, less smoothing |
| `ANTENNA_SWITCH_STREAK` | 3 | Higher = slower to accept direction change, more stable |
| `SCALE` | 500 | Map units per metre. Higher = tags spread further from reader |
| `MAX_DISTANCE` | 450 | Cap in map units — prevents tags flying off-screen on weak signal |
| `DEAD_ZONE` | 22 | Higher = stationary tags more locked, but small real movements ignored |

### Calibrating MEASURED_POWER

Place a tag exactly 1 metre from the reader. Read the logged RSSI value. Set `MEASURED_POWER` to that value. This is the single most impactful calibration step.

### Calibrating PATH_LOSS_N

Typical values:
- `2.0` — open space, line of sight
- `2.5` — typical indoor (current default)
- `3.0–4.0` — cluttered indoor, lots of obstructions

## Future Work

**Kalman Filter** — replace the dead zone with a proper state estimator. Predicts tag trajectory between updates, converges faster on real movement, ignores noise more intelligently. Overkill for the current single-reader POC but the right long-term approach.

**Multiple readers** — if additional readers are deployed, trilateration becomes possible (requires ≥3 readers seeing the same tag). Each reader's RSSI gives a distance circle; the intersection is the position. Would require significant engine restructuring.

**Zone events** — fire a WebSocket event when a tag crosses from one antenna sector into another. Useful for entry/exit detection without needing precise coordinates.
