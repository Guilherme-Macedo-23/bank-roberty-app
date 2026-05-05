import { SYMBOLS, FOX_IDLE_COUNT, FOX_WIN_COUNT } from './config.js';

const BASE = '/assets/animation/_Sequences';

function frames(folder, prefix, count) {
  return Array.from({ length: count }, (_, i) => ({
    alias: `${prefix}_${String(i).padStart(2, '0')}`,
    src: `${folder}/${prefix}_${String(i).padStart(2, '0')}.png`,
  }));
}

export const MANIFEST = {
  bundles: [
    {
      name: 'preloader',
      assets: [
        { alias: 'bg_preloader', src: '/assets/previews/static previews/preloader.png' },
        { alias: 'bg_game',      src: '/assets/previews/static previews/main scene 1.png' },
        ...frames(`${BASE}/Character/Idle`, 'Fox-Idle', FOX_IDLE_COUNT),
        ...frames(`${BASE}/Character/Win`,  'Win',      FOX_WIN_COUNT),
      ],
    },
    {
      name: 'symbols',
      assets: SYMBOLS.flatMap(sym =>
        frames(`${BASE}/Objects/${sym.id}`, sym.id, sym.frames)
      ),
    },
    {
      name: 'wins',
      assets: [
        ...frames(`${BASE}/Wins/Big_Win`,        'Big_Win',        46),
        ...frames(`${BASE}/Wins/Mega_Win`,        'Mega_Win',       46),
        ...frames(`${BASE}/Wins/Super_MEga_Win`,  'Super_Mega_Win', 46),
        ...frames(`${BASE}/Wins/Total_Win`,       'Total_Win',      46),
      ],
    },
  ],
};

export function getSymbolTextures(Assets, symbolId, count) {
  return Array.from({ length: count }, (_, i) =>
    Assets.get(`${symbolId}_${String(i).padStart(2, '0')}`)
  );
}

export function getFoxIdleTextures(Assets) {
  return Array.from({ length: FOX_IDLE_COUNT }, (_, i) =>
    Assets.get(`Fox-Idle_${String(i).padStart(2, '0')}`)
  );
}

export function getFoxWinTextures(Assets) {
  return Array.from({ length: FOX_WIN_COUNT }, (_, i) =>
    Assets.get(`Win_${String(i).padStart(2, '0')}`)
  );
}

export function getWinTextures(Assets, winName, count) {
  return Array.from({ length: count }, (_, i) =>
    Assets.get(`${winName}_${String(i).padStart(2, '0')}`)
  );
}
