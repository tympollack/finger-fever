import React from 'react';

export interface ScorePanelProps {
  score: number;
  maxCombo: number;
  perfectHits: number;
  greatHits: number;
  goodHits: number;
  misses: number;
  onRestart: () => void;
}

export const ScorePanel: React.FC<ScorePanelProps> = ({
  score,
  maxCombo,
  perfectHits,
  greatHits,
  goodHits,
  misses,
  onRestart,
}) => {
  const totalNotes = perfectHits + greatHits + goodHits + misses;
  const accuracy =
    totalNotes > 0
      ? (
          ((perfectHits * 1.0 + greatHits * 0.7 + goodHits * 0.4) / totalNotes) *
          100
        ).toFixed(1)
      : '0.0';

  const getRank = () => {
    const acc = parseFloat(accuracy);
    if (acc >= 95) return { grade: 'S', color: '#facc15' };
    if (acc >= 85) return { grade: 'A', color: '#10b981' };
    if (acc >= 70) return { grade: 'B', color: '#06b6d4' };
    if (acc >= 50) return { grade: 'C', color: '#f59e0b' };
    return { grade: 'D', color: '#ef4444' };
  };

  const rank = getRank();

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      data-testid="score-panel"
    >
      <div
        className="w-full max-w-md max-h-full overflow-y-auto p-6 rounded-2xl bg-slate-900 border-4 border-slate-700 shadow-2xl text-center my-auto"
        style={{
          boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1)',
        }}
      >
        <h2 className="text-2xl font-black uppercase tracking-widest text-slate-300 mb-1">
          Stage Cleared
        </h2>
        <div
          className="text-6xl font-black mb-4 font-mono"
          style={{ color: rank.color, textShadow: `0 0 20px ${rank.color}88` }}
          data-testid="rank-grade"
        >
          {rank.grade}
        </div>

        <div className="space-y-3 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-sm">
          <div className="flex justify-between font-mono">
            <span className="text-slate-400">Final Score:</span>
            <span className="text-xl font-black text-white" data-testid="final-score">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-slate-400">Max Combo:</span>
            <span className="font-bold text-amber-400">{maxCombo}x</span>
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-slate-400">Accuracy:</span>
            <span className="font-bold text-emerald-400">{accuracy}%</span>
          </div>
          <hr className="border-slate-800 my-2" />
          <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center">
            <div className="bg-emerald-950/50 p-1.5 rounded border border-emerald-800">
              <div className="text-emerald-400 font-bold">PERFECT</div>
              <div className="text-white text-base font-black">{perfectHits}</div>
            </div>
            <div className="bg-cyan-950/50 p-1.5 rounded border border-cyan-800">
              <div className="text-cyan-400 font-bold">GREAT</div>
              <div className="text-white text-base font-black">{greatHits}</div>
            </div>
            <div className="bg-amber-950/50 p-1.5 rounded border border-amber-800">
              <div className="text-amber-400 font-bold">GOOD</div>
              <div className="text-white text-base font-black">{goodHits}</div>
            </div>
            <div className="bg-red-950/50 p-1.5 rounded border border-red-800">
              <div className="text-red-400 font-bold">MISS</div>
              <div className="text-white text-base font-black">{misses}</div>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          data-testid="restart-button"
          className="w-full py-3 px-6 rounded-xl font-black uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 border-2 border-cyan-300/50"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
