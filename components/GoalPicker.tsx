import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {C, F} from '../theme';
import {fmt} from '../usage';

const PRESETS = [60, 120, 180, 240, 300];

export function GoalPicker({value, onChange}: {value: number; onChange: (m: number) => void}) {
  const set = (m: number) => onChange(Math.min(720, Math.max(15, m)));
  return (
    <View>
      <View style={s.row}>
        <Pressable style={s.round} onPress={() => set(value - 15)} hitSlop={8}>
          <Text style={s.roundT}>−</Text>
        </Pressable>
        <View style={{alignItems: 'center', minWidth: 120}}>
          <Text style={s.val}>{fmt(value)}</Text>
          <Text style={s.sub}>per day</Text>
        </View>
        <Pressable style={s.round} onPress={() => set(value + 15)} hitSlop={8}>
          <Text style={s.roundT}>+</Text>
        </Pressable>
      </View>
      <View style={s.chips}>
        {PRESETS.map(p => (
          <Pressable key={p} onPress={() => onChange(p)} style={[s.chip, value === p && s.chipOn]}>
            <Text style={[s.chipT, value === p && {color: '#fff'}]}>{fmt(p)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  round: {width: 48, height: 48, borderRadius: 24, backgroundColor: '#E4DEF8', alignItems: 'center', justifyContent: 'center'},
  roundT: {fontFamily: F.heavy, fontSize: 26, color: C.header, marginTop: -2},
  val: {fontFamily: F.heavy, fontSize: 36, color: C.ink, letterSpacing: -0.5},
  sub: {fontFamily: F.semi, fontSize: 13, color: C.muted},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16},
  chip: {paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: '#EFEBFC'},
  chipOn: {backgroundColor: C.header},
  chipT: {fontFamily: F.bold, fontSize: 13, color: C.header},
});
