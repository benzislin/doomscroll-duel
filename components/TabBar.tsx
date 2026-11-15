import React, {useRef, useEffect} from 'react';
import {View, Text, Pressable, Image, Animated, StyleSheet} from 'react-native';
import {C, F, SOFT} from '../theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type Tab = 'home' | 'battles' | 'profile';

const ICONS: Record<Tab, any> = {
  home: require('../assets/icons/home.png'),
  battles: require('../assets/icons/battles.png'),
  profile: require('../assets/icons/profile.png'),
};

function Item({tab, active, badge, onPress}: {tab: Tab; active: boolean; badge?: number; onPress: () => void}) {
  const sc = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(sc, {toValue: active ? 1 : 0, useNativeDriver: true, friction: 6}).start();
  }, [active, sc]);
  const scale = sc.interpolate({inputRange: [0, 1], outputRange: [1, 1.12]});
  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <Animated.View style={[s.item, active && s.itemOn, {transform: [{scale}]}]}>
        <Image source={ICONS[tab]} style={[s.icon, {tintColor: active ? '#fff' : 'rgba(255,255,255,0.5)'}]} />
        {badge ? (
          <View style={s.badge}>
            <Text style={s.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

export function TabBar({
  tab,
  onChange,
  badges,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  badges?: Partial<Record<Tab, number>>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.wrap, {bottom: insets.bottom + 14}]} pointerEvents="box-none">
      <View style={s.bar}>
        {(['home', 'battles', 'profile'] as Tab[]).map(t => (
          <Item key={t} tab={t} active={tab === t} badge={badges?.[t]} onPress={() => onChange(t)} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {position: 'absolute', left: 0, right: 0, bottom: 26, alignItems: 'center'},
  bar: {flexDirection: 'row', backgroundColor: C.navy, borderRadius: 34, padding: 8, gap: 10, ...SOFT, shadowOpacity: 0.4, elevation: 12},
  item: {width: 64, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center'},
  itemOn: {backgroundColor: C.header},
  icon: {width: 26, height: 26},
  badge: {
    position: 'absolute',
    top: 2,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B4E',
    borderWidth: 2,
    borderColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {color: '#fff', fontFamily: F.heavy, fontSize: 10},
});
