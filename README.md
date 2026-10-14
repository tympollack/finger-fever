# Finger Fever

Arcade rhythm and tap target reaction game by SunShade Entertainment, powered by Kenney UI & Input Prompt assets.

## Overview
Finger Fever challenges players with high-tempo rhythm/tap target nodes, animated feedback rings, combo meters, and countdown gauges.

- **TapTarget (`src/components/TapTarget.tsx`)**: Responsive touch target nodes featuring shrinking hit-timing rings, sub-16ms latency feedback, and Kenney Input Prompt glyphs (tap, double-tap, directional swipe).
- **ComboMeter (`src/components/ComboMeter.tsx`)**: Kenney Interface style countdown timer gauge, fever progress meter, and dynamic combo multiplier badge scaling up on consecutive hits.
- **ArcadeStage (`src/components/ArcadeStage.tsx`)**: High-tempo arcade playfield orchestrating target spawning, tempo changes, accuracy judgment tracking, and score summary panels.

## Development

```bash
npm install
npm run dev
npm test
npm run build
```
