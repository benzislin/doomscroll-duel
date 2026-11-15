import React, {useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {Player} from '../mockData';
import {C, F, Swatch} from '../theme';
import {Card, ChunkyButton, Shell} from '../components/ui';
import {UsageStack} from '../components/UsageStack';
import {SummaryCard, WeekChart, Tiles, Leaderboard} from '../components/HomeInsights';
import {fmt, pxPerMinute, topApps, totalMinutes} from '../usage';
import {analyze, verdict} from '../history';

const H = 420;
const DEFAULT_GOAL = 180;

type Props = {
  me: Player;
  friends: Player[]; // you + your accepted friends
  colors: Record<string, Swatch>;
  granted: boolean;
  syncing: boolean;
  status: string;
  onGoal?: (minutes: number) => void; // goal is edited in Profile
  onGrant: () => void;
};

export default function HomeScreen({me, friends, colors, granted, syncing, status, onGrant}: Props) {
  const [showAll, setShowAll] = useState(false);
  const total = totalMinutes(me);
  const apps = topApps(me.apps);
  const k = pxPerMinute(total, apps.length, H);
  const goal: number = (me as any).goalMinutes ?? DEFAULT_GOAL;
  const a = analyze((me as any).history, total, goal);
  const v = verdict(a, total, goal, fmt);
  const all = me.apps.filter(x => x.minutes > 0).sort((x, y) => y.minutes - x.minutes);
  const real = all[0] ?? null;
  const shown = new Set(apps.map(x => x.name));
  const hidden = all.filter(x => !shown.has(x.name)).length;

  return (
    <Shell title={fmt(total)} subtitle={`${me.name} · today`}>
      <SummaryCard v={v} today={total} avg={a.avg} goal={goal} />

      <Card>
        <Text style={{fontFamily: F.heavy, fontSize: 17, color: C.ink, marginBottom: 12}}>Today's apps</Text>
        {apps.length === 0 ? (
          <Text style={{color: C.muted, fontWeight: '700'}}>No usage yet. It syncs automatically.</Text>
        ) : (
          <UsageStack apps={apps} colors={colors} k={k} height={H} brackets />
        )}

        {all.length > 0 ? (
          <>
            <Pressable
              onPress={() => setShowAll(x => !x)}
              style={{alignSelf: 'flex-start', marginTop: 14, backgroundColor: '#E4DEF8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14}}>
              <Text style={{fontFamily: F.heavy, fontSize: 13, color: C.header}}>
                {showAll ? 'Hide full list' : `See all apps (${all.length})`}
                {!showAll && hidden > 0 ? ` · ${hidden} in Other` : ''}
              </Text>
            </Pressable>
            {showAll ? (
              <View style={{marginTop: 10}}>
                {all.map(x => (
                  <View key={x.name} style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 6}}>
                    <Text style={{flex: 1, fontFamily: F.bold, fontSize: 15, color: C.ink}} numberOfLines={1}>
                      {x.name}
                    </Text>
                    {!shown.has(x.name) ? (
                      <Text style={{fontFamily: F.heavy, fontSize: 10, color: C.header, backgroundColor: '#E4DEF8', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, marginRight: 8, overflow: 'hidden'}}>
                        OTHER
                      </Text>
                    ) : null}
                    <Text style={{fontFamily: F.heavy, fontSize: 14, color: C.muted}}>{fmt(x.minutes)}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </Card>

      <WeekChart days={a.days} avg={a.avg} goal={goal} />
      <Tiles streak={a.streak} best={a.best} topApp={real} />
      <Leaderboard players={friends} meId={me.id} />

      {!granted ? (
        <Card style={{marginTop: 4}}>
          <Text style={{color: C.ink, fontWeight: '800', marginBottom: 10}}>
            Usage access is off. Grant it so the app can read your real screen time.
          </Text>
          <ChunkyButton title="Grant usage access" onPress={onGrant} />
        </Card>
      ) : (
        <View style={{marginTop: 4}}>
          <Text style={{color: C.muted, fontWeight: '700', textAlign: 'center'}}>
            {syncing ? 'Syncing…' : status || 'Live · updates every minute'}
          </Text>
        </View>
      )}
    </Shell>
  );
}
