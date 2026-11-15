export type Hist = Record<string, number>;

export const dayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export type Day = {key: string; label: string; minutes?: number};

export function lastDays(n: number): {key: string; label: string}[] {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({key: dayKey(d), label: LETTERS[d.getDay()]});
  }
  return out;
}

// Today is still in progress, so "today vs average" is judged by PACE:
// how much of a typical day you've used compared with how much of the
// waking day (6am to midnight) has passed.
export function analyze(history: Hist | undefined, today: number, goal: number) {
  const h = history ?? {};
  const todayKey = dayKey();
  const days: Day[] = lastDays(7).map(d => ({
    ...d,
    minutes: d.key === todayKey ? today : h[d.key],
  }));
  const prior = days
    .slice(0, 6)
    .map(d => d.minutes)
    .filter((v): v is number => typeof v === 'number' && v > 0);
  const avg = prior.length >= 2 ? Math.round(prior.reduce((a, b) => a + b, 0) / prior.length) : null;

  const now = new Date();
  const hrs = now.getHours() + now.getMinutes() / 60;
  const dayFrac = Math.min(1, Math.max(0.08, (hrs - 6) / 18));
  const pace = avg ? today / avg / dayFrac : null;
  const goalPace = today / goal / dayFrac;

  let streak = 0; // consecutive finished days at or under goal, ending yesterday
  for (let i = 5; i >= 0; i--) {
    const v = days[i].minutes;
    if (typeof v === 'number' && v > 0 && v <= goal) {
      streak++;
    } else {
      break;
    }
  }
  let best: Day | null = null;
  for (const d of days.slice(0, 6)) {
    if (typeof d.minutes === 'number' && d.minutes > 0 && (!best || d.minutes < (best.minutes as number))) {
      best = d;
    }
  }
  return {days, avg, pace, goalPace, streak, best, dayFrac};
}

export type Verdict = {tone: 'good' | 'ok' | 'high'; title: string; body: string};

export function verdict(
  a: ReturnType<typeof analyze>,
  today: number,
  goal: number,
  fmt: (m: number) => string,
): Verdict {
  if (today > goal) {
    return {tone: 'high', title: 'Over your goal', body: `You've passed your ${fmt(goal)} goal for today.`};
  }
  if (today === 0) {
    return {tone: 'good', title: 'Fresh start', body: 'No screen time yet today.'};
  }
    // Early in the day, pace is too noisy. Judge against the goal instead.
  if (a.dayFrac < 0.3) {
    const left = goal - today;
    if (today / goal < 0.5) {
      return {tone: 'good', title: 'Good start', body: `${fmt(left)} left in today's goal.`};
    }
    return {tone: 'ok', title: 'Keep an eye on it', body: `${fmt(left)} left in today's goal.`};
  }
  const ratio = a.pace ?? a.goalPace;
  const ref = a.pace !== null ? 'your usual pace' : 'your goal pace';
  const pct = Math.round(Math.abs(1 - ratio) * 100);
  if (ratio < 0.9) {
    return {tone: 'good', title: 'Good job', body: `You're ${pct}% under ${ref} today.`};
  }
  if (ratio <= 1.1) {
    return {tone: 'ok', title: 'Right on track', body: `About where you'd expect by now.`};
  }
  return {tone: 'high', title: 'Heads up', body: `You're ${pct}% over ${ref} today.`};
}
