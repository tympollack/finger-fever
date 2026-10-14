import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TapTargetProps, HitJudgment, HitResult } from '../types';
import { KenneyPromptIcon } from '../assets/KenneyPrompts';

export const TapTarget: React.FC<TapTargetProps> = ({
  id,
  x,
  y,
  radius = 44,
  promptType,
  durationMs = 1200,
  spawnTime = Date.now(),
  onHit,
  onMiss,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tapCount, setTapCount] = useState<number>(0);
  const [hitFeedback, setHitFeedback] = useState<HitJudgment | null>(null);
  const [ringScale, setRingScale] = useState<number>(2.5);
  const [isResolved, setIsResolved] = useState<boolean>(false);

  // Gesture tracking for swipe
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasTriggeredRef = useRef<boolean>(false);

  // High performance animation loop for shrinking ring
  useEffect(() => {
    if (isResolved || disabled) return;

    let animId: number;
    const updateRing = () => {
      const now = performance.now();
      const elapsed = now - spawnTime;
      const progress = Math.min(Math.max(elapsed / durationMs, 0), 1.3);

      // Ring shrinks from 2.5x down to 1.0x (perfect target hit size)
      const currentScale = 2.5 - progress * 1.5;
      setRingScale(currentScale);

      // Check for timeout miss
      if (progress >= 1.25 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setIsResolved(true);
        setHitFeedback('miss');
        if (onMiss) {
          onMiss(id);
        }
        return;
      }

      animId = requestAnimationFrame(updateRing);
    };

    animId = requestAnimationFrame(updateRing);
    return () => cancelAnimationFrame(animId);
  }, [id, durationMs, spawnTime, isResolved, disabled, onMiss]);

  const evaluateHit = useCallback((): HitResult => {
    const t0 = performance.now();
    const elapsed = t0 - spawnTime;
    const timeDelta = Math.abs(elapsed - durationMs);
    const latency = performance.now() - t0; // sub-1ms internal processing latency

    let judgment: HitJudgment = 'miss';
    let scoreBonus = 0;

    if (timeDelta <= 75) {
      judgment = 'perfect';
      scoreBonus = 300;
    } else if (timeDelta <= 160) {
      judgment = 'great';
      scoreBonus = 180;
    } else if (timeDelta <= 260) {
      judgment = 'good';
      scoreBonus = 90;
    } else {
      judgment = 'miss';
      scoreBonus = 0;
    }

    return {
      targetId: id,
      judgment,
      scoreBonus,
      latencyMs: latency,
      timestamp: Date.now(),
    };
  }, [id, durationMs, spawnTime]);

  const getEventCoords = (e: React.PointerEvent<HTMLDivElement>) => {
    const native = e.nativeEvent as any;
    const clientX = e.clientX ?? native?.clientX ?? 0;
    const clientY = e.clientY ?? native?.clientY ?? 0;
    return { x: clientX, y: clientY };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || isResolved || hasTriggeredRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const coords = getEventCoords(e);
    dragStartRef.current = { x: coords.x, y: coords.y, time: performance.now() };

    if (promptType === 'tap') {
      hasTriggeredRef.current = true;
      const result = evaluateHit();
      setIsResolved(true);
      setHitFeedback(result.judgment);
      onHit(result);
    } else if (promptType === 'double_tap') {
      const nextCount = tapCount + 1;
      setTapCount(nextCount);
      if (nextCount >= 2) {
        hasTriggeredRef.current = true;
        const result = evaluateHit();
        setIsResolved(true);
        setHitFeedback(result.judgment);
        onHit(result);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || isResolved || hasTriggeredRef.current) return;
    if (!dragStartRef.current) return;

    if (promptType.startsWith('swipe_')) {
      const coords = getEventCoords(e);
      const dx = coords.x - dragStartRef.current.x;
      const dy = coords.y - dragStartRef.current.y;
      const threshold = 20; // px threshold

      let swipeDetected = false;
      if (promptType === 'swipe_left' && dx <= -threshold) {
        swipeDetected = true;
      } else if (promptType === 'swipe_right' && dx >= threshold) {
        swipeDetected = true;
      } else if (promptType === 'swipe_up' && dy <= -threshold) {
        swipeDetected = true;
      } else if (promptType === 'swipe_down' && dy >= threshold) {
        swipeDetected = true;
      }

      if (swipeDetected) {
        hasTriggeredRef.current = true;
        const result = evaluateHit();
        setIsResolved(true);
        setHitFeedback(result.judgment);
        onHit(result);
        dragStartRef.current = null;
      }
    }
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
  };

  // Border & Glow color according to prompt type and state
  const getPromptAccentColor = () => {
    if (hitFeedback === 'perfect') return '#10b981'; // emerald
    if (hitFeedback === 'great') return '#06b6d4'; // cyan
    if (hitFeedback === 'good') return '#f59e0b'; // amber
    if (hitFeedback === 'miss') return '#ef4444'; // red

    switch (promptType) {
      case 'double_tap':
        return '#a855f7'; // purple
      case 'swipe_left':
      case 'swipe_right':
        return '#3b82f6'; // blue
      case 'swipe_up':
      case 'swipe_down':
        return '#ec4899'; // pink
      case 'tap':
      default:
        return '#06b6d4'; // cyan
    }
  };

  const accentColor = getPromptAccentColor();
  const targetDiameter = radius * 2;
  const timingRingRadius = radius * ringScale;

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      data-testid={`tap-target-${id}`}
      data-prompt-type={promptType}
      data-resolved={isResolved}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${targetDiameter}px`,
        height: `${targetDiameter}px`,
        transform: 'translate(-50%, -50%)',
        touchAction: 'none',
        userSelect: 'none',
        cursor: isResolved ? 'default' : 'pointer',
        zIndex: isResolved ? 10 : 20,
      }}
      className="flex items-center justify-center"
    >
      {/* Shrinking Hit-Timing Ring */}
      {!isResolved && (
        <svg
          style={{
            position: 'absolute',
            left: `${radius - timingRingRadius}px`,
            top: `${radius - timingRingRadius}px`,
            width: `${timingRingRadius * 2}px`,
            height: `${timingRingRadius * 2}px`,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
          data-testid="timing-ring"
        >
          <circle
            cx={timingRingRadius}
            cy={timingRingRadius}
            r={Math.max(timingRingRadius - 2, 1)}
            fill="none"
            stroke={Math.abs(ringScale - 1.0) < 0.2 ? '#facc15' : accentColor}
            strokeWidth={Math.abs(ringScale - 1.0) < 0.2 ? 4 : 2.5}
            strokeDasharray={promptType === 'double_tap' ? '6 4' : undefined}
            opacity={Math.min(Math.max(1.8 - ringScale * 0.4, 0.4), 1.0)}
            filter="drop-shadow(0 0 4px rgba(255,255,255,0.4))"
          />
        </svg>
      )}

      {/* Core Target Node (Kenney Button/Circle Arcade Styled) */}
      <div
        className={`relative rounded-full flex items-center justify-center transition-transform ${
          isResolved && hitFeedback !== 'miss' ? 'scale-110' : ''
        }`}
        style={{
          width: `${targetDiameter}px`,
          height: `${targetDiameter}px`,
          backgroundColor: '#0f172a',
          border: `3.5px solid ${accentColor}`,
          boxShadow: isResolved
            ? `0 0 20px ${accentColor}`
            : `0 0 12px ${accentColor}66, inset 0 2px 4px rgba(255,255,255,0.25)`,
        }}
      >
        <KenneyPromptIcon type={promptType} size={targetDiameter * 0.65} color={accentColor} />

        {/* Double-tap counter pill */}
        {promptType === 'double_tap' && !isResolved && (
          <span
            className="absolute -bottom-1 right-0 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-purple-700 text-white border border-purple-400"
            data-testid="tap-counter"
          >
            {tapCount}/2
          </span>
        )}
      </div>

      {/* Hit Feedback Burst Animation */}
      {hitFeedback && (
        <div
          data-testid="hit-feedback-badge"
          style={{
            position: 'absolute',
            top: '-26px',
            color: accentColor,
            fontWeight: 900,
            fontSize: '14px',
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 10px currentColor',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            animation: 'pulse 0.4s ease-out forwards',
          }}
        >
          {hitFeedback}!
        </div>
      )}
    </div>
  );
};
