import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TapTarget } from '../src/components/TapTarget';
import { HitResult } from '../src/types';

describe('TapTarget Component', () => {
  it('renders tap target circle with Kenney prompt icon and shrinking timing ring', () => {
    const handleHit = vi.fn();
    render(
      <TapTarget
        id="target-1"
        x={150}
        y={200}
        radius={44}
        promptType="tap"
        durationMs={1000}
        spawnTime={performance.now()}
        onHit={handleHit}
      />
    );

    const targetEl = screen.getByTestId('tap-target-target-1');
    expect(targetEl).toBeInTheDocument();
    expect(targetEl).toHaveAttribute('data-prompt-type', 'tap');

    // Kenney tap prompt icon rendered
    expect(screen.getByTestId('kenney-prompt-tap')).toBeInTheDocument();

    // Shrinking hit-timing ring rendered
    expect(screen.getByTestId('timing-ring')).toBeInTheDocument();
  });

  it('triggers hit response with <16ms latency on pointer down for tap prompt', () => {
    let capturedResult: HitResult | null = null;
    const handleHit = vi.fn((result: HitResult) => {
      capturedResult = result;
    });

    const perfSpy = vi.spyOn(performance, 'now');
    let currentTime = 5000;
    perfSpy.mockImplementation(() => currentTime);

    render(
      <TapTarget
        id="target-tap-quick"
        x={100}
        y={100}
        promptType="tap"
        durationMs={1000}
        spawnTime={4000} // hit exactly at sweet spot (5000 - 4000 = 1000ms)
        onHit={handleHit}
      />
    );

    const targetEl = screen.getByTestId('tap-target-target-tap-quick');
    fireEvent.pointerDown(targetEl, { clientX: 100, clientY: 100 });

    expect(handleHit).toHaveBeenCalledTimes(1);
    expect(capturedResult).not.toBeNull();
    // Internal touch response latency must be strictly <16ms
    expect(capturedResult!.latencyMs).toBeLessThan(16);
    expect(capturedResult!.judgment).toBe('perfect');
    expect(capturedResult!.scoreBonus).toBe(300);
    expect(screen.getByTestId('hit-feedback-badge')).toHaveTextContent(/perfect/i);

    perfSpy.mockRestore();
  });

  it('supports keyboard input with Space and Enter keys for tap and double-tap', () => {
    const handleHit = vi.fn();
    render(
      <TapTarget
        id="target-keyboard"
        x={100}
        y={100}
        promptType="tap"
        durationMs={1000}
        spawnTime={performance.now()}
        onHit={handleHit}
      />
    );

    const targetEl = screen.getByTestId('tap-target-target-keyboard');
    fireEvent.keyDown(targetEl, { key: ' ' });
    expect(handleHit).toHaveBeenCalledTimes(1);
  });

  it('ignores auto-repeat keydown events for double-tap targets', () => {
    const handleHit = vi.fn();
    render(
      <TapTarget
        id="target-keyboard-repeat"
        x={100}
        y={100}
        promptType="double_tap"
        durationMs={1000}
        spawnTime={performance.now()}
        onHit={handleHit}
      />
    );

    const targetEl = screen.getByTestId('tap-target-target-keyboard-repeat');
    // First press
    fireEvent.keyDown(targetEl, { key: ' ', repeat: false });
    expect(screen.getByTestId('tap-counter')).toHaveTextContent('1/2');
    expect(handleHit).not.toHaveBeenCalled();

    // Auto-repeat held keydown event — must be ignored!
    fireEvent.keyDown(targetEl, { key: ' ', repeat: true });
    expect(screen.getByTestId('tap-counter')).toHaveTextContent('1/2');
    expect(handleHit).not.toHaveBeenCalled();

    // Second distinct key press — completes gesture
    fireEvent.keyDown(targetEl, { key: ' ', repeat: false });
    expect(handleHit).toHaveBeenCalledTimes(1);
  });

  it('handles double-tap prompt requiring two sequential taps', () => {
    const handleHit = vi.fn();
    render(
      <TapTarget
        id="target-double"
        x={200}
        y={200}
        promptType="double_tap"
        durationMs={1000}
        spawnTime={performance.now()}
        onHit={handleHit}
      />
    );

    expect(screen.getByTestId('kenney-prompt-double-tap')).toBeInTheDocument();
    expect(screen.getByTestId('tap-counter')).toHaveTextContent('0/2');

    const targetEl = screen.getByTestId('tap-target-target-double');

    // First tap
    fireEvent.pointerDown(targetEl, { clientX: 200, clientY: 200 });
    expect(screen.getByTestId('tap-counter')).toHaveTextContent('1/2');
    expect(handleHit).not.toHaveBeenCalled();

    // Second tap completes gesture
    fireEvent.pointerDown(targetEl, { clientX: 200, clientY: 200 });
    expect(handleHit).toHaveBeenCalledTimes(1);
  });

  it('handles directional swipe gesture prompts (swipe_right)', () => {
    const handleHit = vi.fn();
    render(
      <TapTarget
        id="target-swipe"
        x={300}
        y={300}
        promptType="swipe_right"
        durationMs={1000}
        spawnTime={performance.now()}
        onHit={handleHit}
      />
    );

    expect(screen.getByTestId('kenney-prompt-swipe-right')).toBeInTheDocument();
    const targetEl = screen.getByTestId('tap-target-target-swipe');

    // Start drag
    fireEvent.pointerDown(targetEl, { clientX: 300, clientY: 300 });
    expect(handleHit).not.toHaveBeenCalled();

    // Move right by 35px (exceeding 20px swipe threshold)
    fireEvent.pointerMove(targetEl, { clientX: 335, clientY: 300 });
    expect(handleHit).toHaveBeenCalledTimes(1);
  });
});
