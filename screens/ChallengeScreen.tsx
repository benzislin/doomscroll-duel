import React, {useMemo, useState} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet} from 'react-native';
import {Player} from '../mockData';
import {Shell, Card, Avatar, ChunkyButton} from '../components/ui';
import {knownApps, NewBattle} from '../battle';
import {C, F} from '../theme';

const DURATIONS = [
  {d: 1, l: '1 day'},
  {d: 3, l: '3 days'},
  {d: 7, l: '1 week'},
  {d: 14, l: '2 weeks'},
];

function Chip({label, on, onPress}: {label: string; on: boolean; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={[s.chip, on && s.chipOn]}>
      <Text style={[s.chipT, on && {color: '#fff'}]}>{label}</Text>
    </Pressable>
  );
}

type Props = {
  me: Player;
  opp: Player;
  onBack: () => void;
  onSend: (o: NewBattle) => Promise<unknown>;
  initial?: NewBattle; // set when editing a challenge that has not been accepted yet
  editing?: boolean;
};

export default function ChallengeScreen({me, opp, onBack, onSend, initial, editing}: Props) {
  const [days, setDays] = useState(initial?.days ?? 3);
  const [startOffset, setStartOffset] = useState<0 | 1>(initial?.startOffset ?? 1);
  const [excluded, setExcluded] = useState<string[]>(initial?.excluded ?? []);
  const [wager, setWager] = useState(initial?.wager ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const apps = useMemo(() => {
    const agg: Record<string, number> = {};
    [...knownApps(me), ...knownApps(opp)].forEach(a => {
      agg[a.name] = (agg[a.name] ?? 0) + a.minutes;
    });
    const top = Object.keys(agg)
      .sort((x, y) => agg[y] - agg[x])
      .slice(0, 20);
    (initial?.excluded ?? []).forEach(n => {
      if (!top.includes(n)) {
        top.push(n);
      }
    });
    return top;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, opp]);

  const toggle = (n: string) =>
    setExcluded(ex => (ex.includes(n) ? ex.filter(x => x !== n) : [...ex, n]));

  const send = async () => {
    setBusy(true);
    setErr('');
    try {
      await onSend({days, startOffset, excluded, wager: wager.trim()});
      onBack();
    } catch (e) {
      setErr(
        editing
          ? 'Could not save. Your friend may have already accepted.'
          : 'Could not send the challenge. Try again.',
      );
      setBusy(false);
    }
  };

  return (
    <Shell title={editing ? 'Edit challenge' : 'New challenge'} subtitle={`vs ${opp.name}`} onBack={onBack}>
      <Card>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Avatar name={me.name} size={44} />
          <View style={{marginLeft: -10}}>
            <Avatar name={opp.name} size={44} color="#3F8CFF" />
          </View>
          <Text style={s.vs}>
            {me.name} vs {opp.name}
          </Text>
        </View>
        <Text style={s.hint}>Whoever has the lowest screen time over the battle wins.</Text>
      </Card>

      <Card>
        <Text style={s.h}>How long?</Text>
        <View style={s.chips}>
          {DURATIONS.map(x => (
            <Chip key={x.d} label={x.l} on={days === x.d} onPress={() => setDays(x.d)} />
          ))}
        </View>
        <Text style={[s.h, {marginTop: 18}]}>Starts</Text>
        <View style={s.chips}>
          <Chip label="When accepted" on={startOffset === 0} onPress={() => setStartOffset(0)} />
          <Chip label="Next day" on={startOffset === 1} onPress={() => setStartOffset(1)} />
        </View>
        <Text style={s.hint}>
          {startOffset === 0
            ? 'The day it is accepted counts, including time already used that day.'
            : 'A clean start: it begins at midnight after it is accepted.'}
        </Text>
      </Card>

      <Card>
        <Text style={s.h}>Exclude apps</Text>
        <Text style={s.hint}>Excluded apps do not count for either of you.</Text>
        {apps.length === 0 ? (
          <Text style={[s.hint, {marginTop: 10}]}>No apps to pick from yet. Usage shows up after a sync.</Text>
        ) : (
          <View style={[s.chips, {marginTop: 12}]}>
            {apps.map(n => (
              <Chip key={n} label={n} on={excluded.includes(n)} onPress={() => toggle(n)} />
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Text style={s.h}>Stakes (optional)</Text>
        <TextInput
          style={s.input}
          placeholder="Loser buys coffee"
          placeholderTextColor={C.muted}
          value={wager}
          onChangeText={setWager}
          maxLength={40}
        />
      </Card>

      {err ? <Text style={s.err}>{err}</Text> : null}
      <ChunkyButton title={busy ? (editing ? 'Saving…' : 'Sending…') : editing ? 'Save changes' : `Challenge ${opp.name}`} onPress={send} disabled={busy} />
    </Shell>
  );
}

const s = StyleSheet.create({
  vs: {marginLeft: 12, fontFamily: F.heavy, fontSize: 17, color: C.ink, flex: 1},
  h: {fontFamily: F.heavy, fontSize: 16, color: C.ink, marginBottom: 10},
  hint: {fontFamily: F.semi, fontSize: 13, color: C.muted, marginTop: 8},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, backgroundColor: '#EFEBFC'},
  chipOn: {backgroundColor: C.header},
  chipT: {fontFamily: F.bold, fontSize: 13, color: C.header},
  input: {backgroundColor: C.bg, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontFamily: F.semi, color: C.ink},
  err: {fontFamily: F.bold, color: '#6F63CC', marginBottom: 10},
});
