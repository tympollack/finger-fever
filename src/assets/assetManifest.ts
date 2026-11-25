import {
  KENNEY_CDN_BASE,
  uiSpritesAtlas,
  getFrameCoordinates,
  getKenneyAudioUrl,
  loadCatalogAssets,
  assetRegistry,
  type AtlasFrame,
  type CatalogAsset,
  type HotSwapListener,
  type SupabaseClientLike,
  type UiSpriteKey,
} from '@digitalcanopy/assets';
import type { GesturePromptType } from '../types';

export const FEVER_APP_SCOPE = 'finger-fever';

export interface FeverResolvedAsset {
  spriteKey: string;
  cdnUrl: string;
  atlasUrl: string;
  atlasFrame?: AtlasFrame;
}

export const PROMPT_UI_SPRITE_MAP: Record<GesturePromptType, UiSpriteKey> = {
  tap: 'button-round-blue',
  double_tap: 'button-round-yellow',
  swipe_left: 'icon-arrow-left',
  swipe_right: 'icon-arrow-right',
  swipe_up: 'icon-arrow-up',
  swipe_down: 'icon-arrow-down',
};

let hydrated = false;

export async function hydrateFingerFeverCatalog(
  supabaseClient?: SupabaseClientLike,
  force = false,
): Promise<CatalogAsset[]> {
  if (hydrated && !force && !supabaseClient) {
    return loadCatalogAssets({ app_scope: FEVER_APP_SCOPE, fallbackToSeed: true });
  }
  const assets = await loadCatalogAssets({
    app_scope: FEVER_APP_SCOPE,
    supabaseClient,
    fallbackToSeed: true,
  });
  assetRegistry.loadCatalog(assets, FEVER_APP_SCOPE);
  hydrated = true;
  return assets;
}

export function resetFeverAssetHydrationForTest(): void {
  hydrated = false;
}

export function resolveUiSpriteAsset(spriteKey: UiSpriteKey): FeverResolvedAsset {
  return {
    spriteKey,
    cdnUrl: assetRegistry.resolveAssetUrl('ui-pack', spriteKey, 'png'),
    atlasUrl: uiSpritesAtlas.meta.image,
    atlasFrame:
      assetRegistry.resolveFrame(uiSpritesAtlas, spriteKey) ??
      getFrameCoordinates(uiSpritesAtlas, spriteKey),
  };
}

export function resolvePromptSpriteAsset(promptType: GesturePromptType): FeverResolvedAsset {
  const spriteKey = PROMPT_UI_SPRITE_MAP[promptType] ?? 'button-round-blue';
  return resolveUiSpriteAsset(spriteKey);
}

export function resolveCountdownMeterAssets(): {
  bg: FeverResolvedAsset;
  fill: FeverResolvedAsset;
  panel: FeverResolvedAsset;
} {
  return {
    bg: resolveUiSpriteAsset('bar-progress-bg'),
    fill: resolveUiSpriteAsset('bar-progress-fill'),
    panel: resolveUiSpriteAsset('panel-metal'),
  };
}

export function resolveParticleSparkAsset(): {
  assetKey: string;
  cdnUrl: string;
} {
  const assetKey = 'fx-particle-starburst';
  const cdnUrl = assetRegistry.hasOverride(assetKey)
    ? assetRegistry.resolveUrl(assetKey)
    : `${KENNEY_CDN_BASE}/particles/starburst.png`;
  return { assetKey, cdnUrl };
}

export function resolveFeverAudioUrl(soundKey = 'audio-ui-tap'): string {
  if (assetRegistry.hasOverride(soundKey)) {
    return assetRegistry.resolveAudioUrl(soundKey, 'ogg');
  }
  return getKenneyAudioUrl(soundKey.replace(/^audio-/, ''), 'ogg');
}

export function subscribeFeverAssetSwaps(listener: HotSwapListener): () => void {
  return assetRegistry.onSwap(listener);
}
