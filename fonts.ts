import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {F} from './theme';

// Call once, at the very top of App.tsx. Gives every <Text> the kit font and
// maps fontWeight to the right font file (Android needs one family per weight).
export function applyFonts() {
  const T: any = Text;
  if (T.__patched || !T.render) return;
  const orig = T.render;
  T.render = function (...args: any[]) {
    const el = orig.apply(this, args);
    const flat: any = StyleSheet.flatten(el.props.style) || {};
    const w = String(flat.fontWeight ?? '400');
    const family =
      flat.fontFamily ?? (+w >= 800 ? F.heavy : +w >= 600 || w === 'bold' ? F.bold : F.semi);
    return React.cloneElement(el, {
      style: [el.props.style, {fontFamily: family, fontWeight: 'normal'}],
    });
  };
  T.__patched = true;
}
