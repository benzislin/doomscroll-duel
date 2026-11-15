import React, {useEffect, useRef} from 'react';
import {View, Text, Animated, Easing, StyleSheet} from 'react-native';
import {AppUsage} from '../mockData';
import {MIN_BLOCK, GAP, fmt} from '../usage';
import {Swatch, OTHER, F, C} from '../theme';

type Props = {apps: AppUsage[]; colors: Record<string, Swatch>; k: number; height: number; brackets?: boolean};

function Block({app, sw, h, brackets, delay}: {app: AppUsage; sw: Swatch; h: number; brackets?: boolean; delay: number}) {
  const g = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    g.setValue(0);
    Animated.timing(g, {toValue: 1, duration: 800, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false}).start();
  }, [h, delay, g]);
  const height = g.interpolate({inputRange: [0, 1], outputRange: [0, h]});
  const tall = h >= 56;
  const nameEl = <Text numberOfLines={1} style={[s.name, {color: sw.ink}]}>{app.name}</Text>;
  return (
    <View style={{flexDirection: 'row', alignItems: 'flex-end', marginTop: GAP}}>
      <Animated.View style={[s.block, {height, backgroundColor: sw.face}]}>
        <View style={s.sheen} />
        {brackets || tall ? (
          <>
            {nameEl}
            {!brackets ? <Text style={[s.min, {color: sw.ink}]}>{fmt(app.minutes)}</Text> : null}
          </>
        ) : (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1}}>{nameEl}</View>
            <Text style={[s.min, {color: sw.ink, fontFamily: F.bold}]}>{fmt(app.minutes)}</Text>
          </View>
        )}
      </Animated.View>
      {brackets ? (
        <Animated.View style={{height, flexDirection: 'row', alignItems: 'center', marginLeft: 8, opacity: g}}>
          <View style={s.br} />
          <Text style={s.brText}>{app.minutes} min</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const CELL = 42;
const COLS = 7;

function Grid({height}: {height: number}) {
  const rows = Math.floor(height / CELL);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({length: rows + 1}, (_, i) => (
        <View key={'h' + i} style={[g.h, {bottom: i * CELL}]} />
      ))}
      {Array.from({length: COLS + 1}, (_, i) => (
        <View key={'v' + i} style={[g.v, {left: `${(i * 100) / COLS}%`}]} />
      ))}
    </View>
  );
}

const g = StyleSheet.create({
  h: {position: 'absolute', left: 0, right: 0, height: 1.5, backgroundColor: 'rgba(91,79,214,0.09)'},
  v: {position: 'absolute', top: 0, bottom: 0, width: 1.5, backgroundColor: 'rgba(91,79,214,0.09)'},
});

export function UsageStack({apps, colors, k, height, brackets}: Props) {
  return (
    <View style={{height, justifyContent: 'flex-start', flexDirection: 'column-reverse'}}>
      {brackets ? <Grid height={height} /> : null}
      {apps.map((a, i) => (
        <Block key={a.name} app={a} sw={colors[a.name] ?? OTHER} h={Math.round(MIN_BLOCK + a.minutes * k)} brackets={brackets} delay={i * 110} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  block: {flex: 1, minWidth: 120, borderRadius: 20, justifyContent: 'center', paddingHorizontal: 14, overflow: 'hidden'},
  sheen: {position: 'absolute', top: 0, left: 0, right: 0, height: '48%', backgroundColor: 'rgba(255,255,255,0.16)'},
  name: {fontFamily: F.heavy, fontSize: 15},
  min: {fontFamily: F.semi, fontSize: 12, opacity: 0.9},
  br: {width: 10, height: '100%', borderTopWidth: 3, borderRightWidth: 3, borderBottomWidth: 3, borderColor: C.muted, borderTopRightRadius: 6, borderBottomRightRadius: 6},
  brText: {marginLeft: 8, fontFamily: F.bold, fontSize: 13, color: C.ink},
});
