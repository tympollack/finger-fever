import {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';

export interface ShockwaveParticle {
  id: number;
  active: boolean;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}

export interface ParticleEmitterHandle {
  emitShockwave: (x: number, y: number, color?: string) => void;
  getActiveCount: () => number;
  getPoolSize: () => number;
  clear: () => void;
}

interface ParticleEmitterProps {
  poolSize?: number;
}

const DEFAULT_POOL_SIZE = 20;
const SHOCKWAVE_DURATION_MS = 650;

/**
 * High-performance pooled particle emitter for Finger Fever.
 * Pools textures & DOM nodes to prevent memory allocations/leaks during intense rhythm gameplay.
 * Emits Kenney-styled concentric shockwaves and sparkle bursts on perfect taps.
 */
export const ParticleEmitter = forwardRef<ParticleEmitterHandle, ParticleEmitterProps>(
  ({ poolSize = DEFAULT_POOL_SIZE }, ref) => {
    // Fixed-size pre-allocated pool
    const [particles, setParticles] = useState<ShockwaveParticle[]>(() =>
      Array.from({ length: poolSize }, (_, i) => ({
        id: i,
        active: false,
        x: 0,
        y: 0,
        color: '#38bdf8',
        createdAt: 0,
      }))
    );

    const particlesRef = useRef(particles);
    particlesRef.current = particles;

    const emitShockwave = useCallback(
      (x: number, y: number, color = '#38bdf8') => {
        let assignedId = -1;
        setParticles((prev) => {
          const now = performance.now();
          // Find first inactive slot
          let slotIndex = prev.findIndex((p) => !p.active);

          // If pool exhausted, recycle the oldest slot to prevent unbounded memory growth
          if (slotIndex === -1) {
            let oldestTime = Infinity;
            slotIndex = 0;
            prev.forEach((p, idx) => {
              if (p.createdAt < oldestTime) {
                oldestTime = p.createdAt;
                slotIndex = idx;
              }
            });
          }

          assignedId = prev[slotIndex].id;
          const next = [...prev];
          next[slotIndex] = {
            id: assignedId,
            active: true,
            x,
            y,
            color,
            createdAt: now,
          };
          return next;
        });

        // Automatically dispose and return to pool upon animation completion
        window.setTimeout(() => {
          setParticles((prev) =>
            prev.map((p) => (p.id === assignedId ? { ...p, active: false } : p))
          );
        }, SHOCKWAVE_DURATION_MS);
      },
      []
    );

    const clear = useCallback(() => {
      setParticles((prev) => prev.map((p) => ({ ...p, active: false })));
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        emitShockwave,
        getActiveCount: () => particlesRef.current.filter((p) => p.active).length,
        getPoolSize: () => particlesRef.current.length,
        clear,
      }),
      [emitShockwave, clear]
    );

    return (
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden z-25"
        data-testid="particle-emitter"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Kenney Particle Pack Sparkle Texture */}
            <g id="kenney-sparkle-star">
              <path
                d="M 0 -14 Q 2 -3 14 0 Q 3 2 0 14 Q -2 3 -14 0 Q -3 -2 0 -14 Z"
                fill="currentColor"
              />
            </g>
          </defs>

          {particles.map((p) => {
            if (!p.active) return null;

            return (
              <g
                key={p.id}
                className="shockwave-burst"
                data-testid={`shockwave-instance-${p.id}`}
                style={{
                  transform: `translate(${p.x}px, ${p.y}px)`,
                  color: p.color,
                }}
              >
                {/* Concentric Shockwave Ring 1 (Inner fast ripple) */}
                <circle
                  cx={0}
                  cy={0}
                  r={10}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={3}
                  className="animate-shockwave-inner"
                />

                {/* Concentric Shockwave Ring 2 (Middle accented ripple) */}
                <circle
                  cx={0}
                  cy={0}
                  r={18}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                  className="animate-shockwave-mid"
                />

                {/* Concentric Shockwave Ring 3 (Outer broad wave) */}
                <circle
                  cx={0}
                  cy={0}
                  r={26}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  className="animate-shockwave-outer"
                />

                {/* Kenney Radial Sparkle Bursts (Dispersing outward) */}
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <use
                    key={deg}
                    href="#kenney-sparkle-star"
                    className="animate-sparkle-burst"
                    style={{
                      transform: `rotate(${deg}deg) translate(0px, -20px)`,
                      transformOrigin: '0 0',
                    }}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
);

ParticleEmitter.displayName = 'ParticleEmitter';
