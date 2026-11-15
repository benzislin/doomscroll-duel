import {getFirestore, doc, setDoc} from '@react-native-firebase/firestore';
import {me, friend, jordan} from './mockData';

export async function seedFriends() {
  const db = getFirestore();
  await setDoc(doc(db, 'players', friend.id), friend);
  await setDoc(doc(db, 'players', jordan.id), jordan);
}

export async function seedPlayers() {
  await setDoc(doc(getFirestore(), 'players', me.id), me);
  await seedFriends();
}