# Location Engine Design

The Location Engine is responsible for transforming raw telemetry data from the Active Reader devices into (X, Y) coordinates that can be plotted on a 2D map.

## 1. Available Raw Data
From the parsed tag reports (`TagRecord`), we have the following inputs:
- `deviceId`: Identifies which base station detected the tag.
- `antennaChannel`: Which specific antenna (1-4) on the reader picked up the signal.
- `rssi`: Received Signal Strength Indicator (e.g., -70 dBm).
- `tagId`: The unique identifier of the card.

## 2. Required Configuration (Map Meta-data)
Since all antennas are housed within a single physical reader box, they share the exact same `(X, Y)` coordinate on the map. The distinction is that each antenna points in a different direction (a sector). 

To plot tags, the engine needs a **Configuration Map** defining the reader's location and the angle each antenna covers.

```json
{
  "reader_001": {
    "x": 500,
    "y": 300,
    "antennas": {
      "1": { "angle": 0,   "beam_width": 90 }, // Points East
      "2": { "angle": 90,  "beam_width": 90 }, // Points North
      "3": { "angle": 180, "beam_width": 90 }, // Points West
      "4": { "angle": 270, "beam_width": 90 }  // Points South
    }
  }
}
```

## 3. RSSI to Distance Calculation
RSSI decays logarithmically over distance. We can estimate the distance (in meters or abstract map units) using the Log-Distance Path Loss model:

```javascript
// distance = 10 ^ ((MeasuredPower - RSSI) / (10 * N))
const MEASURED_POWER = -50; // Calibrated RSSI at 1 meter distance
const PATH_LOSS_EXPONENT = 2.5; // Environment factor (2 for open space, 3-4 for indoor)

function calculateDistance(rssi) {
  return Math.pow(10, (MEASURED_POWER - rssi) / (10 * PATH_LOSS_EXPONENT));
}
```

## 4. Phased Implementation Strategy

### Phase 1: Sector-Based Proximity (The POC Approach)
Since the antennas are all in one box, the easiest way to plot them is using **polar coordinates** radiating outward from the reader's central point.
1. Look up the reader's `(x, y)` location.
2. Look up the `angle` for the specific `antennaChannel` that detected the tag.
3. Convert the `rssi` into an estimated radius/distance.
4. Apply a randomized "jitter" to the angle (e.g., +/- 20 degrees based on beam width) and distance so tags don't stack on top of each other.
5. Calculate final coordinates using basic trigonometry:
   - `tag_x = reader_x + (distance * cos(angle + angle_jitter))`
   - `tag_y = reader_y + (distance * sin(angle + angle_jitter))`

### Phase 2: Trilateration (Overlapping Readers)
If a single tag is detected by **three or more** different base stations simultaneously, we can use Trilateration.
1. Calculate the distance from the tag to Reader A, Reader B, and Reader C using RSSI.
2. Mathematically solve for the intersection point of the three circles.
3. This provides highly accurate X/Y coordinates but requires dense reader deployment.

### Phase 3: Smoothing & Filtering
Raw RSSI fluctuates wildly due to multi-path fading (signals bouncing off walls).
- **Moving Average:** Average the last N RSSI values for a tag before calculating distance.
- **Kalman Filter:** A mathematical algorithm to predict and smooth the tag's trajectory, preventing the dot on the map from "jumping" erratically.

## 5. Engine Data Flow
1. `TagDataHandler` receives new `TagRecord`.
2. Pass to `LocationEngine.process(record)`.
3. Engine retrieves configuration for `record.deviceId` and `record.antennaChannel`.
4. Engine calculates distance via RSSI.
5. Engine applies the POC strategy (Zone + Jitter).
6. Engine emits `TagPositionUpdateEvent { tagId, x, y, confidence }`.
7. `WebSocketServer` broadcasts event to Frontend.
