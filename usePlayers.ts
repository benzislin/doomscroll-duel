import {useEffect, useState} from 'react';
import {
  getFirestore,
  collection,
  onSnapshot,
} from '@react-native-firebase/firestore';
import {Player} from './mockData';

// null = still loading
export function usePlayers() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(getFirestore(), 'players'),
      snap => setPlayers(snap.docs.map(d => d.data() as Player)),
      err => console.error(err),
    );
    return unsubscribe;
  }, []);
  return players;
}