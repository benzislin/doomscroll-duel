import {useEffect, useState} from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from '@react-native-firebase/firestore';
import {dayKey} from './history';
import {AppUsage, Player} from './mockData';

export type Battle = {
  id: string;
  users: string[];
  from: string;
  to: string;
  status: 'pending' | 'active';
  days: number;
  startOffset: 0 | 1; // 0 = starts the day it's accepted, 1 = the next day
  excluded: string[];
  wager: string;
  startKey?: string;
  endKey?: string;
  createdAt: number;
};

export type NewBattle = {days: number; startOffset: 0 | 1; excluded: string[]; wager: string};

export function useBattles(uid: string): Battle[] {
  const [list, setList] = useState<Battle[]>([]);
  useEffect(() => {
    const q = query(collection(getFirestore(), 'battles'), where('users', 'array-contains', uid));
    return onSnapshot(
      q,
      (snap: any) => setList(snap.docs.map((d: any) => ({id: d.id, ...d.data()}))),
      () => {},
    );
  }, [uid]);
  return list;
}

export const createBattle = (me: string, opp: string, o: NewBattle) =>
  setDoc(doc(getFirestore(), 'battles', `${[me, opp].sort().join('_')}_${Date.now()}`), {
    users: [me, opp],
    from: me,
    to: opp,
    status: 'pending',
    days: o.days,
    startOffset: o.startOffset,
    excluded: o.excluded,
    wager: o.wager,
    createdAt: Date.now(),
  });

// The sender can change the terms for as long as the friend has not accepted.
export async function updateBattle(id: string, o: NewBattle) {
  try {
    const ref = doc(getFirestore(), 'battles', id);
    const snap = await getDoc(ref);
    if (!snap.exists() || (snap.data() as any).status !== 'pending') {
      throw new Error('not-pending');
    }
    await updateDoc(ref, {
      days: o.days,
      startOffset: o.startOffset,
      excluded: o.excluded,
      wager: o.wager,
    });
  } catch (e: any) {
    console.log('updateBattle failed:', e?.code, e?.message, JSON.stringify(o));
    throw e;
  }
}

export const acceptBattle = (b: Battle) => {
  const startKey = addDays(dayKey(), b.startOffset);
  return updateDoc(doc(getFirestore(), 'battles', b.id), {
    status: 'active',
    startKey,
    endKey: addDays(startKey, b.days - 1),
  });
};

// decline, cancel a sent challenge, or clear a finished battle
export const deleteBattle = (b: Battle) => deleteDoc(doc(getFirestore(), 'battles', b.id));

// ---------- dates ----------
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

export function keysBetween(a: string, b: string): string[] {
  const out: string[] = [];
  let k = a;
  while (k <= b && out.length < 60) {
    out.push(k);
    k = addDays(k, 1);
  }
  return out;
}

export function dateLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], {weekday: 'short', month: 'numeric', day: 'numeric'});
}

export type Phase = 'pending' | 'upcoming' | 'live' | 'finished';

export function phase(b: Battle): Phase {
  if (b.status === 'pending') {
    return 'pending';
  }
  const t = dayKey();
  if (t < (b.startKey as string)) {
    return 'upcoming';
  }
  if (t > (b.endKey as string)) {
    return 'finished';
  }
  return 'live';
}

// days of the battle that have data so far (up to today)
export function playedKeys(b: Battle): string[] {
  if (!b.startKey || !b.endKey) {
    return [];
  }
  const last = dayKey() < b.endKey ? dayKey() : b.endKey;
  return keysBetween(b.startKey, last);
}

// ---------- scoring ----------
// Today comes from the live app list; earlier days from the stored daily map.
function dayApps(p: Player, key: string): Record<string, number> {
  if (key === dayKey()) {
    const o: Record<string, number> = {};
    p.apps.forEach(a => {
      o[a.name] = (o[a.name] ?? 0) + a.minutes;
    });
    return o;
  }
  return ((p as any).daily ?? {})[key] ?? {};
}

const isExcluded = (b: Battle, name: string) =>
  b.excluded.some(e => e.toLowerCase() === name.toLowerCase());

export function dayTotal(p: Player, b: Battle, key: string): number {
  let t = 0;
  const m = dayApps(p, key);
  Object.keys(m).forEach(n => {
    if (!isExcluded(b, n)) {
      t += m[n] || 0;
    }
  });
  return t;
}

export function score(p: Player, b: Battle): number {
  return playedKeys(b).reduce((s, k) => s + dayTotal(p, b, k), 0);
}

export function aggApps(p: Player, b: Battle): AppUsage[] {
  const agg: Record<string, number> = {};
  playedKeys(b).forEach(k => {
    const m = dayApps(p, k);
    Object.keys(m).forEach(n => {
      if (!isExcluded(b, n)) {
        agg[n] = (agg[n] ?? 0) + (m[n] || 0);
      }
    });
  });
  return Object.keys(agg)
    .map(name => ({name, minutes: agg[name]}))
    .filter(a => a.minutes > 0)
    .sort((x, y) => y.minutes - x.minutes);
}

// all app names we've seen for a player (for the exclusion picker)
export function knownApps(p: Player): {name: string; minutes: number}[] {
  const agg: Record<string, number> = {};
  p.apps.forEach(a => {
    agg[a.name] = (agg[a.name] ?? 0) + a.minutes;
  });
  const daily = (p as any).daily ?? {};
  Object.keys(daily).forEach(k => {
    if (k === dayKey()) {
      return;
    }
    Object.keys(daily[k]).forEach(n => {
      agg[n] = (agg[n] ?? 0) + (daily[k][n] || 0);
    });
  });
  return Object.keys(agg).map(name => ({name, minutes: agg[name]}));
}
