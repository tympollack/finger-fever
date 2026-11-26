import { createRef } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { KENNEY_CDN_BASE, assetRegistry } from '@digitalcanopy/assets';
import { KenneyPromptIcon } from '../src/assets/KenneyPrompts';
import { ComboMeter } from '../src/components/ComboMeter';
import {
  ParticleEmitter,
  type ParticleEmitterHandle,
} from '../src/components/ParticleEmitter';
import { resetFeverAssetHydrationForTest } from '../src/assets/assetManifest';

describe('Finger Fever CDN sprite rendering & hot-swap bindings', () => {
  beforeEach(() => {
    assetRegistry.reset();
    resetFeverAssetHydrationForTest();
  });

  it('renders CDN sprite <img> in KenneyPromptIcon, updates live on swap, and falls back to SVG on error', () => {
    render(<KenneyPromptIcon type="tap" />);
    const img = screen.getByTestId('kenney-prompt-img-tap');
    expect(img).toHaveAttribute('src', `${KENNEY_CDN_BASE}/ui-pack/button-round-blue.png`);

    act(() => {
      assetRegistry.registerPackOverride('ui-pack', 'https://custom.sunshade.icu/fever-ui');
    });
    expect(screen.getByTestId('kenney-prompt-img-tap')).toHaveAttribute(
      'src',
      'https://custom.sunshade.icu/fever-ui/button-round-blue.png',
    );

    fireEvent.error(screen.getByTestId('kenney-prompt-img-tap'));
    expect(screen.queryByTestId('kenney-prompt-img-tap')).not.toBeInTheDocument();
  });

  it('renders ComboMeter countdown sprites and updates live on swap', () => {
    render(
      <ComboMeter
        combo={6}
        multiplier={2}
        score={1250}
        remainingTimeMs={15000}
        totalTimeMs={45000}
      />,
    );

    expect(screen.getByTestId('timer-gauge-bg-img')).toHaveAttribute(
      'src',
      `${KENNEY_CDN_BASE}/ui-pack/bar-progress-bg.png`,
    );
    expect(screen.getByTestId('timer-gauge-fill-img')).toHaveAttribute(
      'src',
      `${KENNEY_CDN_BASE}/ui-pack/bar-progress-fill.png`,
    );

    act(() => {
      assetRegistry.registerPackOverride('ui-pack', 'https://custom.sunshade.icu/fever-ui');
    });
    expect(screen.getByTestId('timer-gauge-fill-img')).toHaveAttribute(
      'src',
      'https://custom.sunshade.icu/fever-ui/bar-progress-fill.png',
    );
  });

  it('renders ParticleEmitter starburst CDN sprite and updates live on override', () => {
    const emitterRef = createRef<ParticleEmitterHandle>();
    render(<ParticleEmitter ref={emitterRef} poolSize={4} />);

    act(() => {
      emitterRef.current?.emitShockwave(100, 120, '#ff007f');
    });
    expect(screen.getByTestId('particle-spark-img-0')).toHaveAttribute(
      'src',
      `${KENNEY_CDN_BASE}/particles/starburst.png`,
    );

    act(() => {
      assetRegistry.registerOverride(
        'fx-particle-starburst',
        'https://custom.sunshade.icu/spark.png',
      );
    });
    expect(screen.getByTestId('particle-spark-img-0')).toHaveAttribute(
      'src',
      'https://custom.sunshade.icu/spark.png',
    );
  });
});
