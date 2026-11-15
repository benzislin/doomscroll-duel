import {AppUsage, Player} from './mockData';
import {PALETTE, Swatch} from './theme';

export const GAP = 6;
export const MIN_BLOCK = 32;

export const totalMinutes = (p: Player) =>
  p.apps.reduce((sum, a) => sum + a.minutes, 0);

export function fmt(min: number): string {
  if (min < 60) {
    return `${min} min`;
  }
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// Top n-1 apps by minutes, with everything else grouped as "Other".
export function topApps(apps: AppUsage[], n = 6): AppUsage[] {
  const sorted = [...apps].sort((a, b) => b.minutes - a.minutes);
  if (sorted.length <= n) {
    return sorted;
  }
  const head = sorted.slice(0, n - 1);
  const rest = sorted.slice(n - 1).reduce((s, a) => s + a.minutes, 0);
  return [...head, {name: 'Other', minutes: rest}];
}

// One color per app, shared by every screen, so an app looks the same everywhere.
export function buildColorMap(players: Player[]): Record<string, Swatch> {
  const sums: Record<string, number> = {};
  players.forEach(p =>
    p.apps.forEach(a => {
      sums[a.name] = (sums[a.name] || 0) + a.minutes;
    }),
  );
  const names = Object.keys(sums).sort((a, b) => sums[b] - sums[a]);
  const map: Record<string, Swatch> = {};
  names.forEach((n, i) => {
    map[n] = PALETTE[i % PALETTE.length];
  });
  return map;
}

// Pixels per minute so the tallest stack exactly fills `height`.
const FULL_BOX_MINUTES = 360; // a 6h day fills the box; change to taste

export function pxPerMinute(maxTotal: number, maxCount: number, height: number) {
  const room = Math.max(height - maxCount * (MIN_BLOCK + GAP), 0);
  const fit = room / Math.max(maxTotal, 1); // never overflow the box
  const ref = room / FULL_BOX_MINUTES; // absolute scale
  return Math.min(fit, ref);
}