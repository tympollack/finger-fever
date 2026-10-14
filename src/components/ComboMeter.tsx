import React from 'react';
import { ComboMeterProps } from '../types';

export const calculateMultiplier = (combo: number): number => {
  if (combo >= 35) return 5;
  if (combo >= 20) return 4;
  if (combo >= 10) return 3;
  if (combo >= 5) return 2;
  return 1;
};

export const ComboMeter: React.FC<ComboMeterProps> = ({
  combo,
  multiplier,
  score,
  remainingTimeMs,
  totalTimeMs,
  isFeverMode = false,
  feverGauge = 0,
}) => {
  const activeMultiplier = multiplier > 0 ? multiplier : calculateMultiplier(combo);
  const timeProgress = Math.min(Math.max(remainingTimeMs / Math.max(totalTimeMs, 1), 0), 1);
  const secondsLeft = (remainingTimeMs / 1000).toFixed(1);

  // Dynamic scale calculation for combo multiplier
  // Scales up dynamically on consecutive hits (1.0 -> 1.45x)
  const multiplierScale = Math.min(1.0 + activeMultiplier * 0.08 + Math.min(combo * 0.005, 0.2), 1.55);

  // Meter color shifts based on fever and time
  const getTimerBarColor = () => {
    if (timeProgress > 0.45) return '#10b981'; // green
    if (timeProgress > 0.2) return '#f59e0b'; // amber
    return '#ef4444'; // red pulsing
  };

  const getMultiplierTheme = () => {
    if (isFeverMode || activeMultiplier >= 5) {
      return {
        text: '#ff3366',
        bg: 'rgba(255, 51, 102, 0.25)',
        border: '#ff3366',
        glow: '0 0 25px rgba(255, 51, 102, 0.8)',
        label: 'FEVER x5',
      };
    }
    if (activeMultiplier === 4) {
      return {
        text: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.2)',
        border: '#f59e0b',
        glow: '0 0 18px rgba(245, 158, 11, 0.6)',
        label: 'x4 BOOST',
      };
    }
    if (activeMultiplier === 3) {
      return {
        text: '#10b981',
        bg: 'rgba(16, 185, 129, 0.2)',
        border: '#10b981',
        glow: '0 0 14px rgba(16, 185, 129, 0.5)',
        label: 'x3 SURGE',
      };
    }
    if (activeMultiplier === 2) {
      return {
        text: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.2)',
        border: '#06b6d4',
        glow: '0 0 10px rgba(6, 182, 212, 0.4)',
        label: 'x2 RHYTHM',
      };
    }
    return {
      text: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.1)',
      border: '#475569',
      glow: 'none',
      label: 'x1 NORMAL',
    };
  };

  const theme = getMultiplierTheme();

  return (
    <div
      className="w-full max-w-xl mx-auto p-3 select-none"
      data-testid="combo-meter"
    >
      {/* Top Header: Score & Timer */}
      <div className="flex items-center justify-between mb-2 px-1">
        {/* Score Display */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Current Score
          </span>
          <span
            className="text-2xl font-black tracking-tight text-white font-mono"
            data-testid="score-display"
          >
            {score.toLocaleString().padStart(6, '0')}
          </span>
        </div>

        {/* Dynamic Multiplier Badge */}
        <div
          data-testid="multiplier-badge"
          style={{
            transform: `scale(${multiplierScale})`,
            transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
            color: theme.text,
            backgroundColor: theme.bg,
            border: `2px solid ${theme.border}`,
            boxShadow: theme.glow,
          }}
          className="px-3 py-1 rounded-lg flex items-center gap-1 font-black text-sm tracking-widest font-mono"
        >
          <span>{theme.label}</span>
          {combo > 0 && (
            <span className="text-[11px] font-bold opacity-80">({combo} hit{combo > 1 ? 's' : ''})</span>
          )}
        </div>

        {/* Timer Countdown Numeric */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Time Left
          </span>
          <span
            className="text-2xl font-black tracking-tight font-mono"
            style={{ color: getTimerBarColor() }}
            data-testid="timer-display"
          >
            {secondsLeft}s
          </span>
        </div>
      </div>

      {/* Kenney Interface Countdown Meter Frame */}
      <div
        className="w-full h-5 rounded-md p-0.5 mb-2 relative overflow-hidden"
        style={{
          backgroundColor: '#0f172a',
          border: '2px solid #334155',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
        }}
        data-testid="timer-gauge-container"
      >
        <div
          className="h-full rounded-sm transition-all duration-100 ease-linear"
          style={{
            width: `${timeProgress * 100}%`,
            backgroundColor: getTimerBarColor(),
            boxShadow: `0 0 10px ${getTimerBarColor()}aa`,
          }}
          data-testid="timer-gauge-bar"
        />
        {/* Kenney meter segment grid marks */}
        <div className="absolute inset-0 flex justify-between pointer-events-none px-2 opacity-30">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-0.5 h-full bg-black/60" />
          ))}
        </div>
      </div>

      {/* Combo Streak & Fever Energy Bar */}
      <div
        className="w-full h-3 rounded-md p-0.5 relative overflow-hidden"
        style={{
          backgroundColor: '#0f172a',
          border: '1.5px solid #1e293b',
        }}
        data-testid="fever-gauge-container"
      >
        <div
          className="h-full rounded-sm transition-all duration-150 ease-out"
          style={{
            width: `${Math.min(feverGauge > 0 ? feverGauge : combo / 35, 1) * 100}%`,
            background: isFeverMode
              ? 'linear-gradient(90deg, #ff007f, #ffaa00, #ff007f)'
              : 'linear-gradient(90deg, #06b6d4, #10b981)',
            boxShadow: isFeverMode ? '0 0 12px #ff007f' : '0 0 6px #06b6d4',
          }}
          data-testid="fever-gauge-bar"
        />
      </div>

      {/* Footer Status Indicators */}
      <div className="flex justify-between items-center mt-1 px-1 text-[11px] font-bold text-slate-400">
        <span>Streak: <strong className="text-white" data-testid="combo-count">{combo}</strong></span>
        <span className="uppercase tracking-widest text-[10px]">
          {isFeverMode ? (
            <span className="text-pink-400 animate-pulse font-black">★ MAXIMUM FEVER MODE ★</span>
          ) : (
            <span>Streak to Fever: {Math.max(35 - combo, 0)} hits</span>
          )}
        </span>
      </div>
    </div>
  );
};
