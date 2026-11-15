import React, {useEffect, useRef} from 'react';
import {View, Text, Animated, Easing, StyleSheet} from 'react-native';
import {Card, FadeIn, Avatar} from './ui';
import {Player} from '../mockData';
import {C, F} from '../theme';
import {fmt, totalMinutes} from '../usage';
import {Day, Verdict} from '../history';

function Bar({frac, color, delay}: {frac: number; color: string; delay: number}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {toValue: frac, duration: 800, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false}).start();
  }, [frac, delay, v]);
  return (
    <Animated.View
      style={{
        width: '100%',
        borderRadius: 10,
        backgroundColor: color,
        height: v.interpolate({inputRange: [0, 1], outputRange: [0, CHART_H]}),
      }}
    />
  );
}

const CHART_H = 120;

export function SummaryCard({
  v,
  today,
  avg,
  goal,
}: {
  v: Verdict;
  today: number;
  avg: number | null;
  goal: number;
}) {
  const over = today > goal;
  const fill = useRef(new Animated.Value(0)).current;
  const frac = Math.min(1, today / goal);
  useEffect(() => {
    Animated.timing(fill, {toValue: frac, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false}).start();
  }, [frac, fill]);
  const tone = v.tone === 'good' ? C.good : v.tone === 'ok' ? C.header : C.bad;
  return (
    <FadeIn>
      <Card>
        <View style={[s.chip, {backgroundColor: tone}]}>
          <Text style={s.chipText}>{v.tone === 'good' ? 'ON TRACK' : v.tone === 'ok' ? 'STEADY' : 'WATCH OUT'}</Text>
        </View>
        <Text style={s.title}>{v.title}</Text>
        <Text style={s.body}>{v.body}</Text>

        <View style={s.stats}>
          <View style={s.stat}>
            <Text style={s.statV}>{fmt(today)}</Text>
            <Text style={s.statL}>Today</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statV}>{avg === null ? '—' : fmt(avg)}</Text>
            <Text style={s.statL}>Daily average</Text>
          </View>
        </View>
        {avg === null ? (
          <Text style={s.note}>Your average shows up after a couple of days of data.</Text>
        ) : null}

        <View style={s.goalRow}>
          <Text style={s.goalL}>Daily goal · {fmt(goal)}</Text>
        </View>
        <View style={s.track}>
          <Animated.View
            style={[
              s.fill,
              {
                backgroundColor: over ? C.bad : C.header,
                width: fill.interpolate({inputRange: [0, 1], outputRange: ['0%', '100%']}),
              },
            ]}
          />
        </View>
        <Text style={s.note}>{over ? `${fmt(today - goal)} over` : `${fmt(goal - today)} left`}</Text>
      </Card>
    </FadeIn>
  );
}

export function WeekChart({days, avg, goal}: {days: Day[]; avg: number | null; goal: number}) {
  const vals = days.map(d => d.minutes ?? 0);
  const maxV = Math.max(goal, avg ?? 0, ...vals, 60) * 1.1;
  const y = (m: number) => (m / maxV) * CHART_H;
  return (
    <FadeIn delay={120}>
      <Card>
        <Text style={s.h}>Last 7 days</Text>
        <View style={{height: CHART_H + 22, marginTop: 8}}>
          <View style={{height: CHART_H}}>
            <View style={[s.line, {bottom: y(goal), backgroundColor: C.good}]} />
            {avg !== null ? <View style={[s.line, {bottom: y(avg), backgroundColor: '#B9B4DD'}]} /> : null}
            <View style={{flexDirection: 'row', alignItems: 'flex-end', height: CHART_H}}>
              {days.map((d, i) => {
                const known = typeof d.minutes === 'number' && d.minutes > 0;
                const isToday = i === days.length - 1;
                return (
                  <View key={d.key} style={{flex: 1, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'flex-end'}}>
                    {known ? <Text style={s.barV}>{fmt(d.minutes as number)}</Text> : null}
                    {known ? (
                      <Bar frac={y(d.minutes as number) / CHART_H} color={isToday ? C.header : '#9B8FFF'} delay={i * 70} />
                    ) : (
                      <View style={s.stub} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
          <View style={{flexDirection: 'row', marginTop: 6}}>
            {days.map((d, i) => (
              <Text key={d.key} style={[s.day, i === days.length - 1 && {color: C.header}]}>
                {d.label}
              </Text>
            ))}
          </View>
        </View>
        <View style={{flexDirection: 'row', marginTop: 10}}>
          <View style={[s.dot, {backgroundColor: C.good}]} />
          <Text style={s.legend}>Daily goal · {fmt(goal)}</Text>
          {avg !== null ? (
            <>
              <View style={[s.dot, {backgroundColor: '#B9B4DD', marginLeft: 14}]} />
              <Text style={s.legend}>7-day average · {fmt(avg)}</Text>
            </>
          ) : null}
        </View>
      </Card>
    </FadeIn>
  );
}

export function Tiles({streak, best, topApp}: {streak: number; best: Day | null; topApp: {name: string; minutes: number} | null}) {
  return (
    <FadeIn delay={200}>
      <View style={{marginBottom: 14}}>
        <View style={{flexDirection: 'row', gap: 12}}>
          <View style={s.tile}>
            <Text style={s.tileV}>{streak}</Text>
            <Text style={s.tileL}>day streak under goal</Text>
          </View>
          <View style={s.tile}>
            <Text style={s.tileV}>{best ? fmt(best.minutes as number) : '—'}</Text>
            <Text style={s.tileL}>Best day this week</Text>
          </View>
        </View>
        <View style={[s.tile, s.wide]}>
          <View style={{flex: 1, paddingRight: 10}}>
            <Text style={s.tileL}>Top app today</Text>
            <Text style={s.tileV} numberOfLines={1}>
              {topApp ? topApp.name : '—'}
            </Text>
          </View>
          {topApp ? <Text style={s.topT}>{fmt(topApp.minutes)}</Text> : null}
        </View>
      </View>
    </FadeIn>
  );
}

export function Leaderboard({players, meId}: {players: Player[]; meId: string}) {
  const rows = players.map(p => ({p, t: totalMinutes(p)})).sort((x, y) => x.t - y.t);
  const max = Math.max(...rows.map(r => r.t), 1);
  return (
    <FadeIn delay={260}>
      <Card>
        <Text style={s.h}>Leaderboard</Text>
        <Text style={s.body}>Lowest screen time today leads.</Text>
        {rows.length < 2 ? (
          <Text style={[s.body, {marginTop: 10}]}>Add friends to see how you stack up.</Text>
        ) : (
          <View style={{marginTop: 10}}>
            {rows.map((r, i) => {
              const me = r.p.id === meId;
              return (
                <View key={r.p.id} style={[s.lbRow, me && s.lbMe]}>
                  <View style={[s.rk, i === 0 && {backgroundColor: C.header}]}>
                    <Text style={[s.rkT, i === 0 && {color: '#fff'}]}>{i + 1}</Text>
                  </View>
                  <Avatar name={r.p.name} size={36} />
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={s.lbName} numberOfLines={1}>
                      {me ? 'You' : r.p.name}
                    </Text>
                    <View style={s.lbTrack}>
                      <View style={[s.lbFill, {width: `${Math.max(4, (r.t / max) * 100)}%`, backgroundColor: me ? C.header : '#9B8FFF'}]} />
                    </View>
                  </View>
                  <Text style={s.lbTime}>{fmt(r.t)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </Card>
    </FadeIn>
  );
}

const s = StyleSheet.create({
  chip: {alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  chipText: {color: '#fff', fontFamily: F.heavy, fontSize: 11, letterSpacing: 0.6},
  title: {fontFamily: F.heavy, fontSize: 24, color: C.ink, marginTop: 10},
  body: {fontFamily: F.semi, fontSize: 14, color: C.muted, marginTop: 4},
  note: {fontFamily: F.semi, fontSize: 12, color: C.muted, marginTop: 6},
  stats: {flexDirection: 'row', marginTop: 16},
  stat: {flex: 1},
  statV: {fontFamily: F.heavy, fontSize: 22, color: C.ink},
  statL: {fontFamily: F.semi, fontSize: 12, color: C.muted},
  goalRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 8},
  goalL: {fontFamily: F.bold, fontSize: 14, color: C.ink},
  track: {height: 12, borderRadius: 6, backgroundColor: '#DDD7F7', overflow: 'hidden'},
  fill: {height: '100%', borderRadius: 6},
  h: {fontFamily: F.heavy, fontSize: 17, color: C.ink},
  line: {position: 'absolute', left: 0, right: 0, height: 2, opacity: 0.8},
  barV: {fontFamily: F.bold, fontSize: 10, color: C.muted, marginBottom: 3},
  stub: {width: '100%', height: 6, borderRadius: 3, backgroundColor: '#E4DEF8'},
  day: {flex: 1, textAlign: 'center', fontFamily: F.bold, fontSize: 12, color: C.muted},
  dot: {width: 10, height: 10, borderRadius: 5, marginRight: 6, alignSelf: 'center'},
  legend: {fontFamily: F.semi, fontSize: 12, color: C.muted},
  tile: {flex: 1, backgroundColor: '#fff', borderRadius: 22, padding: 14, shadowColor: C.shadow, shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: {width: 0, height: 6}, elevation: 5},
  tileV: {fontFamily: F.heavy, fontSize: 20, color: C.ink},
  tileL: {fontFamily: F.semi, fontSize: 11, color: C.muted, marginTop: 2},
  wide: {flex: 0, flexDirection: 'row', alignItems: 'center', marginTop: 12},
  topT: {fontFamily: F.heavy, fontSize: 18, color: C.header},
  lbRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 16},
  lbMe: {backgroundColor: '#EFEBFC'},
  rk: {width: 26, height: 26, borderRadius: 13, backgroundColor: '#E4DEF8', alignItems: 'center', justifyContent: 'center', marginRight: 10},
  rkT: {fontFamily: F.heavy, fontSize: 13, color: C.header},
  lbName: {fontFamily: F.bold, fontSize: 15, color: C.ink},
  lbTrack: {height: 6, borderRadius: 3, backgroundColor: '#E4DEF8', marginTop: 5, overflow: 'hidden'},
  lbFill: {height: '100%', borderRadius: 3},
  lbTime: {fontFamily: F.heavy, fontSize: 14, color: C.ink, marginLeft: 10},
});
