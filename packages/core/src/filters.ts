import type { Adjustments, FilterId } from './types';

export const FILTER_CSS: Record<FilterId, string> = {
  none: 'none',
  clarendon: 'contrast(1.2) saturate(1.35)',
  gingham: 'brightness(1.05) hue-rotate(-10deg)',
  moon: 'grayscale(1) contrast(1.1) brightness(1.1)',
  lark: 'contrast(0.9) brightness(1.1) saturate(1.1)',
  reyes: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)',
  juno: 'sepia(0.35) hue-rotate(-10deg) contrast(1.15) brightness(1.15) saturate(1.8)',
  slumber: 'saturate(0.66) brightness(1.05)',
  crema: 'sepia(0.5) contrast(1.25) brightness(1.15) saturate(0.9)',
  ludwig: 'contrast(1.05) brightness(1.05) saturate(1.3)',
  aden: 'hue-rotate(-20deg) contrast(0.9) brightness(1.2) saturate(0.85)',
  perpetua: 'contrast(1.1) brightness(1.25) saturate(1.1)',
  amaro: 'contrast(0.9) brightness(1.15) saturate(1.5) hue-rotate(-10deg)',
  mayfair: 'contrast(1.1) brightness(1.1) saturate(1.1)',
  rise: 'sepia(0.25) contrast(0.9) brightness(1.05) saturate(0.9) hue-rotate(0deg)',
  hudson: 'contrast(1.1) brightness(0.9) saturate(1.1)',
  valencia: 'contrast(1.08) brightness(1.08) sepia(0.08) saturate(1.08)',
  xpro2: 'sepia(0.3) contrast(1.3) brightness(0.8) saturate(1.4) hue-rotate(-10deg)',
  sierra: 'contrast(0.8) brightness(1.1) saturate(1.2)',
  willow: 'grayscale(0.5) contrast(0.95) brightness(1.05)',
  lofi: 'saturate(1.1) contrast(1.5)',
  inkwell: 'grayscale(1) brightness(1.1) contrast(1.1)',
  hefe: 'contrast(1.3) brightness(1.2) saturate(1.3) sepia(0.15)',
  nashville: 'sepia(0.4) contrast(1.2) brightness(1.05) hue-rotate(-10deg)',
  toaster: 'sepia(0.4) contrast(1.5) brightness(0.9) hue-rotate(-30deg)',
  walden: 'brightness(1.1) hue-rotate(-10deg) sepia(0.3) saturate(1.6)',
  '1977': 'sepia(0.5) contrast(1.1) brightness(1.2) saturate(1.3) hue-rotate(-10deg)',
  kelvin: 'sepia(0.4) saturate(1.4) brightness(1.1) hue-rotate(-10deg)',
};

export function adjustmentsToCss(a: Adjustments): string {
  const parts: string[] = [];
  if (a.brightness !== 0) parts.push(`brightness(${1 + a.brightness / 100})`);
  if (a.contrast !== 0) parts.push(`contrast(${1 + a.contrast / 100})`);
  if (a.saturation !== 0) parts.push(`saturate(${1 + a.saturation / 100})`);
  if (a.warmth !== 0) parts.push(`sepia(${Math.abs(a.warmth) / 200}) hue-rotate(${a.warmth}deg)`);
  if (a.highlights !== 0) parts.push(`brightness(${1 + a.highlights / 200})`);
  if (a.shadows !== 0) parts.push(`brightness(${1 - a.shadows / 200})`);
  if (a.fade !== 0) parts.push(`opacity(${1 - a.fade / 200})`);
  return parts.length ? parts.join(' ') : 'none';
}

export function combinedCssFilter(filter: FilterId | null, adjustments: Adjustments): string {
  const filters: string[] = [];
  if (filter && filter !== 'none') filters.push(FILTER_CSS[filter]);
  const adj = adjustmentsToCss(adjustments);
  if (adj !== 'none') filters.push(adj);
  return filters.length ? filters.join(' ') : 'none';
}

export const FILTER_IDS: FilterId[] = Object.keys(FILTER_CSS) as FilterId[];
