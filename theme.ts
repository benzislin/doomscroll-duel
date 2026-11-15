export type Swatch = {face: string; edge: string; ink: string};

// ESTIMATED from the Figma kit screenshots. Replace any hex with a sampled one
// (Digital Color Meter on the Mac) and the whole app updates.
export const C = {
  header: '#5B4FD6',
  headerDark: '#4034B0',
  bg: '#EFEBFC',
  card: '#FFFFFF',
  cardEdge: '#E4DEF8',
  ink: '#1D1A4D',
  muted: '#7D79AB',
  navy: '#1A1640',
  good: '#3F8CFF',
  goodEdge: '#2A6FD9',
  bad: '#8E84E8',
  badEdge: '#6F63CC',
  blobA: '#7A6FF0',
  blobB: '#9B8FFF',
  blobC: '#4A3FC4',
  shadow: '#3A2FA0',
};

export const PALETTE: Swatch[] = [
  {face: '#5B4FD6', edge: '#4034B0', ink: '#FFFFFF'},
  {face: '#3F8CFF', edge: '#2A6FD9', ink: '#FFFFFF'},
  {face: '#9B8FFF', edge: '#7E71E6', ink: '#FFFFFF'},
  {face: '#2F5BEA', edge: '#2145C0', ink: '#FFFFFF'},
  {face: '#7C5CFF', edge: '#5F3FE0', ink: '#FFFFFF'},
  {face: '#78B8FF', edge: '#5A9BE6', ink: '#0F2A5C'},
];
export const OTHER: Swatch = {face: '#B9B4DD', edge: '#9C96C6', ink: '#FFFFFF'};

export const F = {
  semi: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  heavy: 'PlusJakartaSans_800ExtraBold',
};

// soft, tinted, layered shadow (not the hard "edge" trick)
export const SOFT = {
  shadowColor: C.shadow,
  shadowOpacity: 0.16,
  shadowRadius: 18,
  shadowOffset: {width: 0, height: 8},
  elevation: 7,
};
