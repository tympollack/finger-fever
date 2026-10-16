import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { TapTarget } from './TapTarget';
import { ComboMeter, calculateMultiplier } from './ComboMeter';
import { ScorePanel } from './ScorePanel';
import { ParticleEmitter, ParticleEmitterHandle } from './ParticleEmitter';
import { GesturePromptType, HitResult } from '../types';

interface TargetInstance {
  id: string;
  x: number;
  y: number;
  promptType: GesturePromptType;
  durationMs: number;
  spawnTime: number;
}

interface ScoreState {
  score: number;
  combo: number;
  maxCombo: number;
}

type ScoreAction =
  | { type: 'HIT'; scoreBonus: number }
  | { type: 'MISS' }
  | { type: 'RESET' };

function scoreReducer(state: ScoreState, action: ScoreAction): ScoreState {
  switch (action.type) {
    case 'HIT': {
      const nextCombo = state.combo + 1;
      const mult = calculateMultiplier(nextCombo);
      return {
        score: state.score + action.scoreBonus * mult,
        combo: nextCombo,
        maxCombo: Math.max(state.maxCombo, nextCombo),
      };
    }
    case 'MISS':
      return {
        ...state,
        combo: 0,
      };
    case 'RESET':
      return {
        score: 0,
        combo: 0,
        maxCombo: 0,
      };
  }
}

const PROMPT_TYPES: GesturePromptType[] = [
  'tap',
  'tap',
  'double_tap',
  'swipe_left',
  'swipe_right',
  'swipe_up',
  'swipe_down',
];

export const ArcadeStage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [{ score, combo, maxCombo }, dispatchScore] = useReducer(scoreReducer, {
    score: 0,
    combo: 0,
    maxCombo: 0,
  });
  const [remainingTimeMs, setRemainingTimeMs] = useState<number>(45000); // 45s stage
  const [targets, setTargets] = useState<TargetInstance[]>([]);
  const [stats, setStats] = useState({
    perfectHits: 0,
    greatHits: 0,
    goodHits: 0,
    misses: 0,
  });

  const totalTimeMs = 45000;
  const stageAreaRef = useRef<HTMLDivElement>(null);
  const particleEmitterRef = useRef<ParticleEmitterHandle>(null);
  const spawnTimerRef = useRef<number | null>(null);
  const gameClockRef = useRef<number | null>(null);
  const remainingTimeRef = useRef<number>(totalTimeMs);
  const targetsRef = useRef<TargetInstance[]>(targets);
  targetsRef.current = targets;
  const handledTargetIdsRef = useRef<Set<string>>(new Set());

  const multiplier = calculateMultiplier(combo);
  const isFeverMode = combo >= 35;

  const handleMiss = useCallback((targetId: string) => {
    if (handledTargetIdsRef.current.has(targetId)) return;
    handledTargetIdsRef.current.add(targetId);

    dispatchScore({ type: 'MISS' });
    setStats((prev) => ({ ...prev, misses: prev.misses + 1 }));

    setTimeout(() => {
      setTargets((prev) => prev.filter((t) => t.id !== targetId));
    }, 250);
  }, []);

  const handleHit = useCallback((result: HitResult) => {
    if (handledTargetIdsRef.current.has(result.targetId)) return;
    handledTargetIdsRef.current.add(result.targetId);

    if (result.judgment === 'miss') {
      handleMiss(result.targetId);
      return;
    }

    dispatchScore({ type: 'HIT', scoreBonus: result.scoreBonus });

    setStats((prev) => ({
      ...prev,
      perfectHits: prev.perfectHits + (result.judgment === 'perfect' ? 1 : 0),
      greatHits: prev.greatHits + (result.judgment === 'great' ? 1 : 0),
      goodHits: prev.goodHits + (result.judgment === 'good' ? 1 : 0),
    }));

    if (result.judgment === 'perfect') {
      const px = result.x ?? targetsRef.current.find((t) => t.id === result.targetId)?.x;
      const py = result.y ?? targetsRef.current.find((t) => t.id === result.targetId)?.y;
      if (px !== undefined && py !== undefined) {
        particleEmitterRef.current?.emitShockwave(
          px,
          py,
          combo >= 34 ? '#f43f5e' : '#38bdf8'
        );
      }
    }

    // Fade out target after brief resolution
    setTimeout(() => {
      setTargets((prev) => prev.filter((t) => t.id !== result.targetId));
    }, 250);
  }, [combo, handleMiss]);

  const startGame = () => {
    dispatchScore({ type: 'RESET' });
    setRemainingTimeMs(totalTimeMs);
    remainingTimeRef.current = totalTimeMs;
    handledTargetIdsRef.current.clear();
    setTargets([]);
    setStats({
      perfectHits: 0,
      greatHits: 0,
      goodHits: 0,
      misses: 0,
    });
    particleEmitterRef.current?.clear();
    setIsGameOver(false);
    setIsPlaying(true);
  };

  // Main countdown timer loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    let lastTime = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;

      // Settle any expired targets independently of animation frames (e.g. background tab)
      targetsRef.current.forEach((t) => {
        if (now - t.spawnTime > t.durationMs + 260 && !handledTargetIdsRef.current.has(t.id)) {
          handleMiss(t.id);
        }
      });

      setRemainingTimeMs((prev) => {
        const next = Math.max(prev - delta, 0);
        remainingTimeRef.current = next;
        if (next <= 0) {
          // If stage ends, settle any remaining unresolved targets as misses
          targetsRef.current.forEach((t) => {
            if (!handledTargetIdsRef.current.has(t.id)) {
              handleMiss(t.id);
            }
          });
          setIsPlaying(false);
          setIsGameOver(true);
          clearInterval(interval);
        }
        return next;
      });
    }, 50);

    gameClockRef.current = interval;
    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, handleMiss]);

  // Target spawner loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    // Spawn speed scales with fever mode
    const spawnInterval = isFeverMode ? 650 : 950;

    const interval = window.setInterval(() => {
      const targetDuration = isFeverMode ? 900 : 1200;

      // Do not spawn targets if there isn't enough time left for their scoring window to complete
      if (remainingTimeRef.current <= targetDuration + 260) {
        return;
      }

      if (!stageAreaRef.current) return;
      const rect = stageAreaRef.current.getBoundingClientRect();
      const targetRadius = 50; // Radius including timing ring boundary
      const minDistance = targetRadius * 2; // Enforce non-overlapping interactive regions

      // Derive bounded coordinates with spacing check so targets do not overlap active ones
      let spawnX = rect.width <= targetRadius * 2 ? rect.width / 2 : targetRadius + Math.random() * (rect.width - targetRadius * 2);
      let spawnY = rect.height <= targetRadius * 2 ? rect.height / 2 : targetRadius + Math.random() * (rect.height - targetRadius * 2);
      let foundCoordinates = false;

      for (let attempt = 0; attempt < 15; attempt++) {
        const candidateX =
          rect.width <= targetRadius * 2
            ? rect.width / 2
            : targetRadius + Math.random() * (rect.width - targetRadius * 2);

        const candidateY =
          rect.height <= targetRadius * 2
            ? rect.height / 2
            : targetRadius + Math.random() * (rect.height - targetRadius * 2);

        const hasOverlap = targetsRef.current.some((t) => {
          const dx = t.x - candidateX;
          const dy = t.y - candidateY;
          return Math.sqrt(dx * dx + dy * dy) < minDistance;
        });

        if (!hasOverlap) {
          spawnX = candidateX;
          spawnY = candidateY;
          foundCoordinates = true;
          break;
        }
      }

      // If arena is too crowded and couldn't find a free position, delay spawn to next interval
      if (!foundCoordinates && targetsRef.current.length > 0) {
        return;
      }

      const randomPrompt =
        PROMPT_TYPES[Math.floor(Math.random() * PROMPT_TYPES.length)];

      const newTarget: TargetInstance = {
        id: `target-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        x: spawnX,
        y: spawnY,
        promptType: randomPrompt,
        durationMs: targetDuration,
        spawnTime: performance.now(),
      };

      setTargets((prev) => [...prev.slice(-6), newTarget]);
    }, spawnInterval);

    spawnTimerRef.current = interval;
    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, isFeverMode]);

  return (
    <div
      className="relative w-full h-screen flex flex-col bg-slate-950 overflow-hidden font-sans select-none"
      data-testid="arcade-stage"
    >
      {/* Top HUD: ComboMeter */}
      <div className="z-30 bg-slate-900/90 border-b border-slate-800 shadow-lg backdrop-blur-md">
        <ComboMeter
          combo={combo}
          multiplier={multiplier}
          score={score}
          remainingTimeMs={remainingTimeMs}
          totalTimeMs={totalTimeMs}
          isFeverMode={isFeverMode}
          feverGauge={combo / 35}
        />
      </div>

      {/* Playfield Arena Surface */}
      <div
        ref={stageAreaRef}
        className="relative flex-1 w-full h-full overflow-hidden touch-none"
        style={{
          background:
            'radial-gradient(circle at center, #1e1b4b 0%, #090d16 100%)',
        }}
      >
        {/* Subtle rhythm grid lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Start Game Prompt Overlay */}
        {!isPlaying && !isGameOver && (
          <div
            className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-slate-950/70"
            data-testid="start-screen"
          >
            <div className="text-center max-w-md">
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400 mb-2 tracking-wider">
                FINGER FEVER
              </h1>
              <p className="text-slate-400 text-sm mb-6 font-medium">
                Tap, double-tap, and swipe targets as shrinking rings hit the
                center. Keep your combo alive to trigger MAXIMUM FEVER!
              </p>
              <button
                onClick={startGame}
                data-testid="start-game-button"
                className="px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-95 transition-all shadow-xl shadow-cyan-500/20 border-2 border-emerald-300/40 text-lg"
              >
                Start Rush
              </button>
            </div>
          </div>
        )}

        {/* Live Rhythm Targets */}
        {isPlaying &&
          targets.map((target) => (
            <TapTarget
              key={target.id}
              id={target.id}
              x={target.x}
              y={target.y}
              promptType={target.promptType}
              durationMs={target.durationMs}
              spawnTime={target.spawnTime}
              onHit={handleHit}
              onMiss={handleMiss}
            />
          ))}

        {/* Kenney Concentric Shockwave Particle Emitter */}
        <ParticleEmitter ref={particleEmitterRef} />

        {/* Post-Stage Score Summary Panel */}
        {isGameOver && (
          <ScorePanel
            score={score}
            maxCombo={maxCombo}
            perfectHits={stats.perfectHits}
            greatHits={stats.greatHits}
            goodHits={stats.goodHits}
            misses={stats.misses}
            onRestart={startGame}
          />
        )}
      </div>
    </div>
  );
};
