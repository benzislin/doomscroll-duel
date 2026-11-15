import React, {useEffect, useRef, useState} from 'react';
import {View, Text, Pressable, Animated, Easing, StyleSheet} from 'react-native';
import {Player} from '../mockData';
import {Shell, Card, Avatar, FadeIn, Pop} from '../components/ui';
import {UsageStack} from '../components/UsageStack';
import ChallengeScreen from './ChallengeScreen';
import {fmt, topApps, pxPerMinute} from '../usage';
import {
  Battle,
  NewBattle,
  phase,
  score,
  aggApps,
  dayTotal,
  playedKeys,
  dateLabel,
  addDays,
} from '../battle';
import {dayKey} from '../history';
import {C, F, Swatch} from '../theme';

const H = 320;

type Props = {
  me: Player;
  players: Player[]; // you + your accepted friends
  colors: Record<string, Swatch>;
  battles: Battle[];
  onChallenge: (opp: Player, o: NewBattle) => Promise<unknown>;
  onAccept: (b: Battle) => Promise<unknown>;
  onDelete: (b: Battle) => Promise<unknown>;
  onEdit: (b: Battle, o: NewBattle) => Promise<unknown>;
};

type Screen =
  | {k: 'list'}
  | {k: 'challenge'; id: string}
  | {k: 'edit'; id: string}
  | {k: 'battle'; id: string};

// ---------- small pieces ----------
function Chip({label, tone}: {label: string; tone: 'good' | 'bad' | 'neutral'}) {
  const bg = tone === 'good' ? C.good : tone === 'bad' ? C.bad : C.header;
  return (
    <View style={[s.chip, {backgroundColor: bg}]}>
      <Text style={s.chipText}>{label}</Text>
    </View>
  );
}

function Pill({label, onPress, solid}: {label: string; onPress: () => void; solid?: boolean}) {
  return (
    <Pressable onPress={onPress} style={[s.pill, {backgroundColor: solid ? C.header : '#E4DEF8'}]}>
      <Text style={[s.pillT, {color: solid ? '#fff' : C.header}]}>{label}</Text>
    </Pressable>
  );
}

function ShareBar({mine, theirs}: {mine: number; theirs: number}) {
  const v = useRef(new Animated.Value(0)).current;
  const pct = mine + theirs === 0 ? 0.5 : mine / (mine + theirs);
  useEffect(() => {
    Animated.timing(v, {toValue: pct, duration: 900, delay: 250, easing: Easing.out(Easing.cubic), useNativeDriver: false}).start();
  }, [pct, v]);
  return (
    <View style={s.track}>
      <Animated.View style={[s.fill, {width: v.interpolate({inputRange: [0, 1], outputRange: ['0%', '100%']})}]} />
    </View>
  );
}

function SectionTitle({children}: {children: string}) {
  return <Text style={s.section}>{children}</Text>;
}

// ---------- head to head view (used for "today" and for real battles) ----------
function Column({p, apps, colors, k, leading, i}: {p: Player; apps: {name: string; minutes: number}[]; colors: Record<string, Swatch>; k: number; leading: boolean; i: number}) {
  const total = apps.reduce((t, a) => t + a.minutes, 0);
  return (
    <View style={{flex: 1}}>
      <FadeIn delay={i * 120} style={{alignItems: 'center', height: 118}}>
        <Avatar name={p.name} size={46} />
        <Text style={s.cName}>{p.name}</Text>
        <Text style={s.cTot}>{fmt(total)}</Text>
        {leading ? <Chip label="LEADING" tone="good" /> : null}
      </FadeIn>
      <UsageStack apps={topApps(apps)} colors={colors} k={k} height={H} />
    </View>
  );
}

function Versus({
  me,
  opp,
  meApps,
  oppApps,
  colors,
  headline,
  hint,
  extra,
  title,
  subtitle,
  onBack,
}: {
  me: Player;
  opp: Player;
  meApps: {name: string; minutes: number}[];
  oppApps: {name: string; minutes: number}[];
  colors: Record<string, Swatch>;
  headline: string;
  hint: string;
  extra?: React.ReactNode;
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  const a = meApps.reduce((t, x) => t + x.minutes, 0);
  const b = oppApps.reduce((t, x) => t + x.minutes, 0);
  const maxCount = Math.max(topApps(meApps).length, topApps(oppApps).length);
  const k = pxPerMinute(Math.max(a, b), maxCount, H);
  return (
    <Shell title={title} subtitle={subtitle} onBack={onBack}>
      <Card>
        <Text style={s.head}>{headline}</Text>
        <Text style={s.hint}>{hint}</Text>
        <View style={[s.row, {justifyContent: 'space-between', marginTop: 14}]}>
          <Text style={s.tot}>
            {me.name} · {fmt(a)}
          </Text>
          <Text style={s.tot}>
            {fmt(b)} · {opp.name}
          </Text>
        </View>
        <ShareBar mine={a} theirs={b} />
      </Card>
      {extra}
      <Card>
        <View style={{flexDirection: 'row', gap: 14}}>
          <Column p={me} apps={meApps} colors={colors} k={k} leading={a < b} i={0} />
          <Column p={opp} apps={oppApps} colors={colors} k={k} leading={b < a} i={1} />
        </View>
      </Card>
    </Shell>
  );
}

// ---------- screen ----------
export default function BattlesScreen({me, players, colors, battles, onChallenge, onAccept, onDelete, onEdit}: Props) {
  const [scr, setScr] = useState<Screen>({k: 'list'});
  const [flash, setFlash] = useState('');
  const friends = players.filter(p => p.id !== me.id);
  const byId = (id: string) => players.find(p => p.id === id);
  const otherId = (b: Battle) => (b.from === me.id ? b.to : b.from);
  const back = () => setScr({k: 'list'});

  useEffect(() => {
    if (!flash) {
      return;
    }
    const t = setTimeout(() => setFlash(''), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  // ---- challenge form
  if (scr.k === 'challenge') {
    const opp = byId(scr.id);
    if (opp) {
      return (
        <ChallengeScreen
          me={me}
          opp={opp}
          onBack={back}
          onSend={async o => {
            await onChallenge(opp, o);
            setFlash(`Challenge sent to ${opp.name}`);
          }}
        />
      );
    }
  }

  // ---- edit a challenge the friend has not accepted yet
  if (scr.k === 'edit') {
    const bt = battles.find(x => x.id === scr.id);
    const opp = bt ? byId(otherId(bt)) : undefined;
    if (bt && opp && bt.status === 'pending') {
      return (
        <ChallengeScreen
          me={me}
          opp={opp}
          editing
          initial={{days: bt.days, startOffset: bt.startOffset, excluded: bt.excluded, wager: bt.wager}}
          onBack={back}
          onSend={async o => {
            await onEdit(bt, o);
            setFlash(`Challenge to ${opp.name} updated`);
          }}
        />
      );
    }
  }

  // ---- a real battle
  if (scr.k === 'battle') {
    const bt = battles.find(x => x.id === scr.id);
    const opp = bt ? byId(otherId(bt)) : undefined;
    if (bt && opp) {
      const ph = phase(bt);
      const a = score(me, bt);
      const b = score(opp, bt);
      const diff = Math.abs(a - b);
      let headline = a === b ? "It's a tie" : `${a < b ? 'You lead' : opp.name + ' leads'} by ${fmt(diff)}`;
      if (ph === 'finished') {
        headline = a === b ? 'It ended in a tie' : a < b ? `You won by ${fmt(diff)}` : `${opp.name} won by ${fmt(diff)}`;
      }
      if (ph === 'upcoming') {
        headline = 'Starts ' + dateLabel(bt.startKey as string);
      }
      const keys = playedKeys(bt);
      const sub =
        ph === 'upcoming'
          ? `${bt.days} day${bt.days === 1 ? '' : 's'}`
          : ph === 'finished'
          ? `${bt.days}-day battle · finished`
          : `Day ${keys.length} of ${bt.days} · ends ${dateLabel(bt.endKey as string)}`;
      const extra = (
        <Card>
          {bt.wager ? <Text style={s.info}>Stakes: {bt.wager}</Text> : null}
          <Text style={s.info}>
            {bt.excluded.length ? `Excluded: ${bt.excluded.join(', ')}` : 'No apps excluded'}
          </Text>
          {keys.length > 0 ? (
            <View style={{marginTop: 12}}>
              {keys.map(k => {
                const x = dayTotal(me, bt, k);
                const y = dayTotal(opp, bt, k);
                return (
                  <View key={k} style={[s.row, {justifyContent: 'space-between', paddingVertical: 4}]}>
                    <Text style={[s.dayV, x < y && {color: C.header}]}>{fmt(x)}</Text>
                    <Text style={s.dayL}>{k === dayKey() ? 'Today' : dateLabel(k)}</Text>
                    <Text style={[s.dayV, y < x && {color: C.header}]}>{fmt(y)}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}
          {ph === 'finished' ? (
            <View style={{marginTop: 12, alignSelf: 'flex-start'}}>
              <Pill label="Clear this battle" onPress={async () => { await onDelete(bt); back(); }} />
            </View>
          ) : null}
        </Card>
      );
      return (
        <Versus
          me={me}
          opp={opp}
          meApps={aggApps(me, bt)}
          oppApps={aggApps(opp, bt)}
          colors={colors}
          headline={headline}
          hint="Lowest screen time over the battle wins."
          extra={extra}
          title={`${me.name} vs ${opp.name}`}
          subtitle={sub}
          onBack={back}
        />
      );
    }
  }

  // ---- list
  const incoming = battles.filter(b => b.status === 'pending' && b.to === me.id);
  const sent = battles.filter(b => b.status === 'pending' && b.from === me.id);
  const running = battles.filter(b => ['live', 'upcoming'].includes(phase(b)));
  const finished = battles.filter(b => phase(b) === 'finished');

  const describe = (b: Battle) =>
    `${b.days} day${b.days === 1 ? '' : 's'} · ${b.startOffset === 0 ? 'starts when accepted' : 'starts next day'}` +
    (b.excluded.length ? ` · excludes ${b.excluded.join(', ')}` : '');

  return (
    <Shell title="Battles" subtitle={`${running.length} active`}>
      {flash ? (
        <FadeIn>
          <Card>
            <Text style={s.flash}>{flash}</Text>
          </Card>
        </FadeIn>
      ) : null}

      {incoming.length > 0 ? (
        <>
          <SectionTitle>Challenges for you</SectionTitle>
          {incoming.map(b => {
            const o = byId(otherId(b));
            return (
              <FadeIn key={b.id}>
                <Card>
                  <View style={s.row}>
                    <Avatar name={o?.name ?? '?'} size={42} />
                    <Text style={s.vs}>{o?.name ?? 'Someone'} challenged you</Text>
                  </View>
                  <Text style={s.info}>{describe(b)}</Text>
                  {b.wager ? <Text style={s.info}>Stakes: {b.wager}</Text> : null}
                  <View style={[s.row, {marginTop: 12}]}>
                    <Pill label="Accept" solid onPress={() => onAccept(b)} />
                    <View style={{width: 8}} />
                    <Pill label="Decline" onPress={() => onDelete(b)} />
                  </View>
                </Card>
              </FadeIn>
            );
          })}
        </>
      ) : null}

      {running.length > 0 ? (
        <>
          <SectionTitle>Active battles</SectionTitle>
          {running.map((b, i) => {
            const o = byId(otherId(b));
            if (!o) {
              return null;
            }
            const ph = phase(b);
            const a = score(me, b);
            const c = score(o, b);
            const label =
              ph === 'upcoming'
                ? b.startKey === addDays(dayKey(), 1)
                  ? 'STARTS TOMORROW'
                  : 'STARTS SOON'
                : a === c
                ? 'TIED'
                : a < c
                ? 'WINNING'
                : 'LOSING';
            const tone = ph === 'upcoming' ? 'neutral' : a === c ? 'neutral' : a < c ? 'good' : 'bad';
            return (
              <FadeIn key={b.id} delay={i * 80}>
                <Pop onPress={() => setScr({k: 'battle', id: b.id})}>
                  <Card>
                    <View style={s.row}>
                      <Avatar name={me.name} size={40} />
                      <View style={{marginLeft: -10}}>
                        <Avatar name={o.name} size={40} color="#3F8CFF" />
                      </View>
                      <Text style={s.vs}>
                        {me.name} vs {o.name}
                      </Text>
                      <Chip label={label} tone={tone} />
                    </View>
                    <Text style={s.info}>
                      {ph === 'upcoming'
                        ? describe(b)
                        : `Day ${playedKeys(b).length} of ${b.days}${b.wager ? ' · ' + b.wager : ''}`}
                    </Text>
                    {ph === 'live' ? (
                      <>
                        <View style={[s.row, {justifyContent: 'space-between', marginTop: 10}]}>
                          <Text style={s.tot}>{fmt(a)}</Text>
                          <Text style={s.tot}>{fmt(c)}</Text>
                        </View>
                        <ShareBar mine={a} theirs={c} />
                      </>
                    ) : null}
                  </Card>
                </Pop>
              </FadeIn>
            );
          })}
        </>
      ) : null}

      {sent.length > 0 ? (
        <>
          <SectionTitle>Waiting for a reply</SectionTitle>
          <Card>
            {sent.map(b => {
              const o = byId(otherId(b));
              return (
                <View key={b.id} style={[s.row, {marginBottom: 10}]}>
                  <Avatar name={o?.name ?? '?'} size={38} />
                  <View style={{flex: 1, marginLeft: 12}}>
                    <Text style={s.fName}>{o?.name ?? 'Friend'}</Text>
                    <Text style={s.fSub}>{describe(b)}</Text>
                  </View>
                  <Pill label="Edit" solid onPress={() => setScr({k: 'edit', id: b.id})} />
                  <View style={{width: 6}} />
                  <Pill label="Cancel" onPress={() => onDelete(b)} />
                </View>
              );
            })}
          </Card>
        </>
      ) : null}

      {finished.length > 0 ? (
        <>
          <SectionTitle>Past battles</SectionTitle>
          {finished.map(b => {
            const o = byId(otherId(b));
            if (!o) {
              return null;
            }
            const a = score(me, b);
            const c = score(o, b);
            return (
              <Pop key={b.id} onPress={() => setScr({k: 'battle', id: b.id})}>
                <Card>
                  <View style={s.row}>
                    <Text style={s.vs}>
                      {me.name} vs {o.name}
                    </Text>
                    <Chip label={a === c ? 'TIE' : a < c ? 'WON' : 'LOST'} tone={a === c ? 'neutral' : a < c ? 'good' : 'bad'} />
                  </View>
                  <Text style={s.info}>
                    {fmt(a)} vs {fmt(c)}
                    {b.wager ? ' · ' + b.wager : ''}
                  </Text>
                </Card>
              </Pop>
            );
          })}
        </>
      ) : null}

      <SectionTitle>Friends</SectionTitle>
      <Card>
        {friends.length === 0 ? (
          <Text style={s.fSub}>No friends yet. Tap the friends icon at the top right to add some.</Text>
        ) : (
          friends.map(f => (
            <View key={f.id} style={[s.row, {marginBottom: 12}]}>
              <Avatar name={f.name} size={42} />
              <View style={{flex: 1, marginLeft: 12}}>
                <Text style={s.fName} numberOfLines={1}>
                  {f.name}
                </Text>
                <Text style={s.fSub}>{(f as any).username ? '@' + (f as any).username : 'Friend'}</Text>
              </View>
              <Pill label="Challenge" solid onPress={() => setScr({k: 'challenge', id: f.id})} />
            </View>
          ))
        )}
      </Card>
    </Shell>
  );
}

const s = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  section: {fontFamily: F.heavy, fontSize: 18, color: C.ink, marginTop: 6, marginBottom: 10, marginLeft: 4},
  vs: {flex: 1, marginLeft: 12, fontFamily: F.heavy, fontSize: 16, color: C.ink},
  tot: {fontFamily: F.bold, fontSize: 15, color: C.muted},
  chip: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  chipText: {color: '#fff', fontFamily: F.heavy, fontSize: 11, letterSpacing: 0.6},
  pill: {paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14},
  pillT: {fontFamily: F.heavy, fontSize: 13},
  track: {height: 12, borderRadius: 6, backgroundColor: '#DDD7F7', marginTop: 8, overflow: 'hidden'},
  fill: {height: '100%', borderRadius: 6, backgroundColor: C.header},
  head: {fontFamily: F.heavy, fontSize: 21, color: C.ink},
  hint: {fontFamily: F.semi, fontSize: 13, color: C.muted, marginTop: 4},
  info: {fontFamily: F.semi, fontSize: 13, color: C.muted, marginTop: 8},
  flash: {fontFamily: F.bold, fontSize: 14, color: C.header},
  cName: {fontFamily: F.heavy, fontSize: 16, color: C.ink, marginTop: 6},
  cTot: {fontFamily: F.bold, fontSize: 14, color: C.muted},
  fName: {fontFamily: F.bold, fontSize: 16, color: C.ink},
  fSub: {fontFamily: F.semi, fontSize: 12, color: C.muted},
  dayL: {fontFamily: F.semi, fontSize: 12, color: C.muted},
  dayV: {fontFamily: F.bold, fontSize: 14, color: C.ink, minWidth: 70},
});
