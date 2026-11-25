import { describe, it, expect, beforeEach } from 'vitest';
import {
  KENNEY_CDN_BASE,
  assetRegistry,
  uiSpritesAtlas,
  getFrameCoordinates,
} from '@digitalcanopy/assets';
import {
  FEVER_APP_SCOPE,
  hydrateFingerFeverCatalog,
  resetFeverAssetHydrationForTest,
  resolveCountdownMeterAssets,
  resolveFeverAudioUrl,
  resolveParticleSparkAsset,
  resolvePromptSpriteAsset,
  subscribeFeverAssetSwaps,
} from '../src/assets/assetManifest';

describe('TASK-PKG-APP-FEVER: @digitalcanopy/assets Tap Target & Countdown Adapter', () => {
  beforeEach(() => {
    assetRegistry.reset();
    resetFeverAssetHydrationForTest();
  });

  it('hydrates shared FX/audio catalog assets into assetRegistry', async () => {
    const assets = await hydrateFingerFeverCatalog(undefined, true);
    expect(assets.some((a) => a.asset_key === 'fx-particle-starburst')).toBe(true);
    expect(assets.some((a) => a.asset_key === 'audio-ui-tap')).toBe(true);
    expect(assetRegistry.hasOverride('fx-particle-starburst')).toBe(true);
    expect(FEVER_APP_SCOPE).toBe('finger-fever');
  });

  it('resolves prompt ring sprites and countdown meter frames from uiSpritesAtlas', () => {
    const tapPrompt = resolvePromptSpriteAsset('tap');
    expect(tapPrompt.spriteKey).toBe('button-round-blue');
    expect(tapPrompt.cdnUrl).toBe(`${KENNEY_CDN_BASE}/ui-pack/button-round-blue.png`);
    expect(tapPrompt.atlasFrame).toEqual(
      getFrameCoordinates(uiSpritesAtlas, 'button-round-blue'),
    );

    const swipeLeft = resolvePromptSpriteAsset('swipe_left');
    expect(swipeLeft.spriteKey).toBe('icon-arrow-left');

    const meter = resolveCountdownMeterAssets();
    expect(meter.bg.spriteKey).toBe('bar-progress-bg');
    expect(meter.fill.spriteKey).toBe('bar-progress-fill');
    expect(meter.panel.spriteKey).toBe('panel-metal');
    expect(meter.bg.atlasUrl).toBe(uiSpritesAtlas.meta.image);
  });

  it('supports runtime pack and key hot-swapping for tap rings, FX, and audio', () => {
    let swaps = 0;
    const unsub = subscribeFeverAssetSwaps(() => {
      swaps += 1;
    });

    assetRegistry.registerPackOverride('ui-pack', 'https://custom-ip.sunshade.icu/fever-ui');
    expect(resolvePromptSpriteAsset('double_tap').cdnUrl).toBe(
      'https://custom-ip.sunshade.icu/fever-ui/button-round-yellow.png',
    );
    expect(resolveCountdownMeterAssets().fill.cdnUrl).toBe(
      'https://custom-ip.sunshade.icu/fever-ui/bar-progress-fill.png',
    );

    assetRegistry.registerOverride(
      'fx-particle-starburst',
      'https://custom-ip.sunshade.icu/fever-spark.png',
    );
    expect(resolveParticleSparkAsset().cdnUrl).toBe(
      'https://custom-ip.sunshade.icu/fever-spark.png',
    );

    assetRegistry.registerOverride('audio-ui-tap', 'https://custom-ip.sunshade.icu/tap.ogg');
    expect(resolveFeverAudioUrl('audio-ui-tap')).toBe('https://custom-ip.sunshade.icu/tap.ogg');
    expect(swaps).toBeGreaterThanOrEqual(3);

    unsub();
  });
});
