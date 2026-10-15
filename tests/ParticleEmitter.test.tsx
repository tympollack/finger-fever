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

  it('recycles oldest particle slots when pool capacity is exceeded to prevent memory leaks', () => {
    const ref = createRef<ParticleEmitterHandle>();
    const poolSize = 3;
    render(<ParticleEmitter ref={ref} poolSize={poolSize} />);

    act(() => {
      ref.current?.emitShockwave(10, 10);
      ref.current?.emitShockwave(20, 20);
      ref.current?.emitShockwave(30, 30);
    });

    expect(ref.current?.getActiveCount()).toBe(3);

    // Emitting a 4th shockwave recycles an existing slot without growing array
    act(() => {
      ref.current?.emitShockwave(40, 40);
    });

    expect(ref.current?.getActiveCount()).toBe(3);
    expect(ref.current?.getPoolSize()).toBe(3);
  });
});
