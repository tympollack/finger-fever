import { createRef } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import {
  ParticleEmitter,
  ParticleEmitterHandle,
} from '../src/components/ParticleEmitter';

describe('ParticleEmitter Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the particle emitter container with empty initial active state', () => {
    render(<ParticleEmitter />);
    const emitter = screen.getByTestId('particle-emitter');
    expect(emitter).toBeInTheDocument();
    expect(screen.queryByTestId(/shockwave-instance-/)).not.toBeInTheDocument();
  });

  it('pools particles and activates a slot on emitShockwave', () => {
    const ref = createRef<ParticleEmitterHandle>();
    render(<ParticleEmitter ref={ref} poolSize={10} />);

    expect(ref.current?.getPoolSize()).toBe(10);
    expect(ref.current?.getActiveCount()).toBe(0);

    act(() => {
      ref.current?.emitShockwave(150, 220, '#38bdf8');
    });

    expect(ref.current?.getActiveCount()).toBe(1);
    const instance = screen.getByTestId('shockwave-instance-0');
    expect(instance).toBeInTheDocument();
    expect(instance.getAttribute('style')).toContain('translate(150px, 220px)');
  });

  it('renders radial sparkles with individual --sparkle-rot CSS custom properties', () => {
    const ref = createRef<ParticleEmitterHandle>();
    render(<ParticleEmitter ref={ref} poolSize={5} />);

    act(() => {
      ref.current?.emitShockwave(100, 100);
    });

    const instance = screen.getByTestId('shockwave-instance-0');
    const uses = instance.querySelectorAll('use');
    expect(uses.length).toBe(6);

    const rotations = Array.from(uses).map((u) => u.style.getPropertyValue('--sparkle-rot'));
    expect(rotations).toEqual(['0deg', '60deg', '120deg', '180deg', '240deg', '300deg']);
  });

  it('automatically disposes particles upon completion back into the pool', () => {
    const ref = createRef<ParticleEmitterHandle>();
    render(<ParticleEmitter ref={ref} poolSize={5} />);

    act(() => {
      ref.current?.emitShockwave(100, 100);
    });

    expect(ref.current?.getActiveCount()).toBe(1);
    expect(screen.getByTestId('shockwave-instance-0')).toBeInTheDocument();

    // Advance time past the 650ms shockwave animation duration
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(ref.current?.getActiveCount()).toBe(0);
    expect(screen.queryByTestId('shockwave-instance-0')).not.toBeInTheDocument();
  });

  it('recycles oldest particle slots when pool capacity is exceeded and resets timers safely', () => {
    const ref = createRef<ParticleEmitterHandle>();
    const poolSize = 1;
    render(<ParticleEmitter ref={ref} poolSize={poolSize} />);

    // First emission at t = 0
    act(() => {
      ref.current?.emitShockwave(10, 10);
    });
    expect(ref.current?.getActiveCount()).toBe(1);

    // Advance 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Re-use slot with second emission at t = 300ms
    act(() => {
      ref.current?.emitShockwave(50, 50);
    });
    expect(ref.current?.getActiveCount()).toBe(1);

    // Advance by 400ms (t = 700ms total). The first timer (scheduled for 650ms) must NOT
    // prematurely cancel the second emission which only started at 300ms (needs to run until 950ms)
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(ref.current?.getActiveCount()).toBe(1);

    // Advance another 300ms (t = 1000ms total). Second emission should now be expired.
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(ref.current?.getActiveCount()).toBe(0);
  });

  it('clears active particles and cancels pending timers on clear()', () => {
    const ref = createRef<ParticleEmitterHandle>();
    render(<ParticleEmitter ref={ref} poolSize={5} />);

    act(() => {
      ref.current?.emitShockwave(100, 100);
      ref.current?.emitShockwave(200, 200);
    });

    expect(ref.current?.getActiveCount()).toBe(2);

    act(() => {
      ref.current?.clear();
    });

    expect(ref.current?.getActiveCount()).toBe(0);
  });

  it('handles batched emissions in the same act() tick and expires both slots independently', () => {
    const ref = createRef<ParticleEmitterHandle>();
    render(<ParticleEmitter ref={ref} poolSize={5} />);

    act(() => {
      // Both emitted in the same batch
      ref.current?.emitShockwave(100, 100);
      ref.current?.emitShockwave(200, 200);
    });

    expect(ref.current?.getActiveCount()).toBe(2);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(ref.current?.getActiveCount()).toBe(0);
  });
});
