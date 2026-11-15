import {getFirestore, doc, getDoc, setDoc} from '@react-native-firebase/firestore';

export const normalizeUsername = (s: string) => s.trim().replace(/^@/, '').toLowerCase();
export const validUsername = (s: string) => /^[a-z0-9_]{3,16}$/.test(s);

// Reserves usernames/<name> -> {uid}, then writes it onto the player doc.
export async function claimUsername(uid: string, raw: string): Promise<string> {
  const u = normalizeUsername(raw);
  if (!validUsername(u)) {
    throw new Error('invalid');
  }
  const db = getFirestore();
  const ref = doc(db, 'usernames', u);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    throw new Error('taken');
  }
  await setDoc(ref, {uid});
  await setDoc(doc(db, 'players', uid), {username: u}, {merge: true});
  return u;
}
