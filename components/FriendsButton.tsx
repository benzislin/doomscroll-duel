import React from 'react';
import {View, Text, Pressable, Image, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {F} from '../theme';

export function FriendsButton({count, onPress}: {count: number; onPress: () => void}) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[s.btn, {top: insets.top + 10}]}>
      <Image source={require('../assets/icons/friends.png')} style={s.icon} />
      {count > 0 ? (
        <View style={s.badge}>
          <Text style={s.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  icon: {width: 24, height: 24, tintColor: '#fff'},
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3B4E',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {color: '#fff', fontFamily: F.heavy, fontSize: 11},
});
