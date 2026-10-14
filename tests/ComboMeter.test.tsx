import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComboMeter, calculateMultiplier } from '../src/components/ComboMeter';

describe('ComboMeter Component', () => {
  it('calculates correct multiplier based on combo streaks', () => {
    expect(calculateMultiplier(0)).toBe(1);
    expect(calculateMultiplier(4)).toBe(1);
    expect(calculateMultiplier(5)).toBe(2);
    expect(calculateMultiplier(9)).toBe(2);
    expect(calculateMultiplier(10)).toBe(3);
    expect(calculateMultiplier(19)).toBe(3);
    expect(calculateMultiplier(20)).toBe(4);
    expect(calculateMultiplier(34)).toBe(4);
    expect(calculateMultiplier(35)).toBe(5);
    expect(calculateMultiplier(100)).toBe(5);
  });

  it('binds Kenney Interface meters to combo streaks and remaining timer countdowns', () => {
    render(
      <ComboMeter
        combo={15}
        multiplier={3}
        score={12500}
        remainingTimeMs={30000}
        totalTimeMs={60000}
        isFeverMode={false}
      />
    );

    // Score and timer display
    expect(screen.getByTestId('score-display')).toHaveTextContent('12,500');
    expect(screen.getByTestId('timer-display')).toHaveTextContent('30.0s');
    expect(screen.getByTestId('combo-count')).toHaveTextContent('15');

    // Timer gauge bar reflects 50% remaining
    const timerBar = screen.getByTestId('timer-gauge-bar');
    expect(timerBar).toHaveStyle('width: 50%');

    // Multiplier badge reflects x3 SURGE
    const badge = screen.getByTestId('multiplier-badge');
    expect(badge).toHaveTextContent(/x3 surge/i);
  });

  it('scales visual combo multiplier up dynamically on consecutive hits', () => {
    const { unmount } = render(
      <ComboMeter
        combo={2}
        multiplier={1}
        score={100}
        remainingTimeMs={45000}
        totalTimeMs={45000}
      />
    );

    const badgeLow = screen.getByTestId('multiplier-badge');
    const transformLow = badgeLow.style.transform;

    unmount();

    // Now test with higher streak and multiplier
    render(
      <ComboMeter
        combo={35}
        multiplier={5}
        score={35000}
        remainingTimeMs={20000}
        totalTimeMs={45000}
        isFeverMode={true}
      />
    );

    const badgeHigh = screen.getByTestId('multiplier-badge');
    const transformHigh = badgeHigh.style.transform;

    // Multiplier badge scale should be greater on consecutive hits
    const scaleLowMatch = parseFloat(transformLow.replace(/[^0-9.]/g, ''));
    const scaleHighMatch = parseFloat(transformHigh.replace(/[^0-9.]/g, ''));

    expect(scaleHighMatch).toBeGreaterThan(scaleLowMatch);
    expect(badgeHigh).toHaveTextContent(/fever x5/i);
  });
});
