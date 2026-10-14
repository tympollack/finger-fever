export type GesturePromptType =
  | 'tap'
  | 'double_tap'
  | 'swipe_left'
  | 'swipe_right'
  | 'swipe_up'
  | 'swipe_down';

export type HitJudgment = 'perfect' | 'great' | 'good' | 'miss';

export interface HitResult {
  targetId: string;
  judgment: HitJudgment;
  scoreBonus: number;
  latencyMs: number;
  timestamp: number;
}

export interface TapTargetProps {
  id: string;
  x: number;
  y: number;
  radius?: number;
  promptType: GesturePromptType;
  durationMs?: number;
  spawnTime?: number;
  onHit: (result: HitResult) => void;
  onMiss?: (id: string) => void;
  disabled?: boolean;
}

export interface ComboMeterProps {
  combo: number;
  multiplier: number;
  score: number;
  remainingTimeMs: number;
  totalTimeMs: number;
  isFeverMode?: boolean;
  feverGauge?: number; // 0.0 to 1.0
  streakMilestone?: number;
}
