import {NativeModules} from 'react-native';
import {getFirestore, doc, setDoc} from '@react-native-firebase/firestore';
import {Player} from './mockData';

export async function syncUsage(player: Player) {
  const apps = await NativeModules.UsageStats.getTodayUsage();
  await setDoc(
    doc(getFirestore(), 'players', player.id),
    {id: player.id, name: player.name, apps},
    {merge: true},
  );
}