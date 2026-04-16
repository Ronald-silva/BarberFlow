import type { CSSProperties } from 'react';

export const DEFAULT_BRAND_MAIN_HEX = '#c8922a';
export const DEFAULT_BRAND_LIGHT_HEX = '#e8b84b';

function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Aceita #rgb ou #rrggbb → #rrggbb minúsculo, ou null se inválido. */
export function normalizeBrandHex(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  const m = s.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  return `#${hex.toLowerCase()}`;
}

function hslToHex(h: number, s: number, l: number): string {
  const S = clamp(s, 0, 100) / 100;
  const L = clamp(l, 0, 100) / 100;
  const H = ((h % 360) + 360) % 360;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => {
    const k = (n + H / 30) % 12;
    const c = L - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(c * 255);
  };
  const r = f(0);
  const g = f(8);
  const b = f(4);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/** Cor principal quando não há cor salva (estável por id). */
export function defaultBrandMainHex(barbershopId: string): string {
  const hue = hashSeed(barbershopId) % 360;
  return hslToHex(hue, 56, 50);
}

/** Tom mais claro para gradientes a partir da cor principal. */
export function accentFromMainHex(mainHex: string): string {
  const hex = normalizeBrandHex(mainHex);
  if (!hex) return DEFAULT_BRAND_LIGHT_HEX;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = 0.42;
  const lr = Math.round(r + (255 - r) * mix);
  const lg = Math.round(g + (255 - g) * mix);
  const lb = Math.round(b + (255 - b) * mix);
  return `#${[lr, lg, lb].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Variáveis CSS do shell do dashboard.
 * `savedPrimaryHex`: cor salva no banco; ausente/null usa paleta automática (ou dourado Shafar sem id).
 */
export function barbershopBrandCssVars(
  barbershopId: string | null | undefined,
  savedPrimaryHex?: string | null
): CSSProperties {
  const normalized = normalizeBrandHex(savedPrimaryHex ?? undefined);

  if (normalized) {
    return {
      '--bs-brand-main': normalized,
      '--bs-brand-light': accentFromMainHex(normalized),
    } as CSSProperties;
  }

  if (!barbershopId) {
    return {
      '--bs-brand-main': DEFAULT_BRAND_MAIN_HEX,
      '--bs-brand-light': DEFAULT_BRAND_LIGHT_HEX,
    } as CSSProperties;
  }

  const main = defaultBrandMainHex(barbershopId);
  return {
    '--bs-brand-main': main,
    '--bs-brand-light': accentFromMainHex(main),
  } as CSSProperties;
}
