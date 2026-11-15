import React, {useEffect, useRef} from 'react';
import {View, Text, Pressable, ScrollView, Animated, Easing, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {C, F, SOFT} from '../theme';

export function Blobs({variant}: {variant: 'header' | 'sheet'}) {
  const h = variant === 'header';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[b.c, {width: 220, height: 220, top: h ? -90 : -40, right: -70, backgroundColor: h ? C.blobA : '#E3DCFB', opacity: h ? 0.55 : 0.8}]} />
      <View style={[b.c, {width: 150, height: 150, top: h ? 20 : 260, left: -60, backgroundColor: h ? C.blobC : '#DDD5FA', opacity: h ? 0.5 : 0.7}]} />
      <View style={[b.c, {width: 90, height: 90, top: h ? 60 : 520, right: 40, backgroundColor: h ? C.blobB : '#E8E2FC', opacity: h ? 0.45 : 0.9}]} />
    </View>
  );
}
const b = StyleSheet.create({c: {position: 'absolute', borderRadius: 999}});

export function FadeIn({children, delay = 0, style}: {children: React.ReactNode; delay?: number; style?: any}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {toValue: 1, duration: 480, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true}).start();
  }, [v, delay]);
  return (
    <Animated.View style={[style, {opacity: v, transform: [{translateY: v.interpolate({inputRange: [0, 1], outputRange: [22, 0]})}]}]}>
      {children}
    </Animated.View>
  );
}

// Pressable that squishes slightly when touched
export function Pop({children, onPress, style}: {children: React.ReactNode; onPress?: () => void; style?: any}) {
  const v = useRef(new Animated.Value(1)).current;
  const to = (x: number) => Animated.spring(v, {toValue: x, useNativeDriver: true, friction: 7, tension: 160}).start();
  return (
    <Pressable onPress={onPress} onPressIn={() => to(0.97)} onPressOut={() => to(1)}>
      <Animated.View style={[style, {transform: [{scale: v}]}]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Card({children, style}: {children: React.ReactNode; style?: any}) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Avatar({name, size = 44, color, edge}: {name: string; size?: number; color?: string; edge?: string}) {
  return (
    <View style={{width: size, height: size, borderRadius: size / 2, backgroundColor: color ?? C.header, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff', ...SOFT, shadowRadius: 8, elevation: 4}}>
      <Text style={{color: '#fff', fontFamily: F.heavy, fontSize: size * 0.42}}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export function ChunkyButton({title, onPress, disabled, color, edge}: {title: string; onPress: () => void; disabled?: boolean; color?: string; edge?: string}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({pressed}) => [s.btn, {backgroundColor: disabled ? '#C9C5E6' : color ?? C.header, transform: [{scale: pressed ? 0.97 : 1}]}]}>
      <Text style={s.btnText}>{title}</Text>
    </Pressable>
  );
}

export function Shell({title, subtitle, onBack, children}: {title: string; subtitle?: string; onBack?: () => void; children: React.ReactNode}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={s.root}>
      <View style={{paddingTop: insets.top + 14, paddingBottom: 30, paddingHorizontal: 22, overflow: 'hidden'}}>
        <Blobs variant="header" />
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12}><Text style={s.back}>‹ Back</Text></Pressable>
        ) : null}
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
      </View>
      <View style={s.sheet}>
        <Blobs variant="sheet" />
        <ScrollView contentContainerStyle={{padding: 18, paddingBottom: 150 + insets.bottom}} showsVerticalScrollIndicator={false}>
        <FadeIn>{children}</FadeIn>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: C.header},
  title: {color: '#fff', fontSize: 30, fontFamily: F.heavy, letterSpacing: -0.5},
  sub: {color: '#D9D4FF', fontSize: 14, marginTop: 4, fontFamily: F.semi},
  back: {color: '#fff', fontSize: 16, fontFamily: F.bold, marginBottom: 6},
  sheet: {flex: 1, backgroundColor: C.bg, borderTopLeftRadius: 34, borderTopRightRadius: 34, overflow: 'hidden'},
  card: {backgroundColor: C.card, borderRadius: 26, padding: 18, marginBottom: 14, ...SOFT},
  btn: {borderRadius: 18, paddingVertical: 15, alignItems: 'center', ...SOFT, shadowOpacity: 0.25, elevation: 5},
  btnText: {color: '#fff', fontSize: 16, fontFamily: F.heavy},
});
