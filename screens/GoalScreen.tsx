import React, {useState} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Blobs, Card, ChunkyButton, FadeIn} from '../components/ui';
import {GoalPicker} from '../components/GoalPicker';
import {C, F} from '../theme';

export default function GoalScreen({onDone}: {onDone: (minutes: number) => Promise<unknown> | void}) {
  const insets = useSafeAreaInsets();
  const [goal, setGoal] = useState(180);
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true);
    try {
      await onDone(goal);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: C.header}}>
      <View style={{paddingTop: insets.top + 40, paddingBottom: 36, paddingHorizontal: 24, overflow: 'hidden'}}>
        <Blobs variant="header" />
        <Text style={s.title}>Set your{'\n'}daily goal</Text>
        <Text style={s.sub}>How much screen time do you want to stay under? You can change it any time in Profile.</Text>
      </View>
      <View style={s.sheet}>
        <Blobs variant="sheet" />
        <ScrollView contentContainerStyle={{padding: 22}}>
          <FadeIn>
            <Card>
              <GoalPicker value={goal} onChange={setGoal} />
            </Card>
            <ChunkyButton title={busy ? 'One sec…' : 'Continue'} onPress={go} disabled={busy} />
          </FadeIn>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  title: {color: '#fff', fontSize: 38, fontFamily: F.heavy, letterSpacing: -1, lineHeight: 42},
  sub: {color: '#D9D4FF', fontSize: 15, marginTop: 8, fontFamily: F.semi},
  sheet: {flex: 1, backgroundColor: C.bg, borderTopLeftRadius: 34, borderTopRightRadius: 34, overflow: 'hidden'},
});
