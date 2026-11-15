import {useEffect, useState} from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from '@react-native-firebase/firestore';

export type Friendship = {
  id: string;
  users: string[];
  from: string;
  to: string;
  status: 'pending' | 'accepted';
};

export function useFriendships(uid: string): Friendship[] {
  const [list, setList] = useState<Friendship[]>([]);
  useEffect(() => {
    const q = query(
      collection(getFirestore(), 'friendships'),
      where('users', 'array-contains', uid),
    );
    return onSnapshot(
      q,
      (snap: any) => setList(snap.docs.map((d: any) => ({id: d.id, ...d.data()}))),
      () => {},
    );
  }, [uid]);
  return list;
}

export const pairId = (a: string, b: string) => [a, b].sort().join('_');

export const sendRequest = (me: string, other: string) =>
  setDoc(doc(getFirestore(), 'friendships', pairId(me, other)), {
    users: [me, other],
    from: me,
    to: other,
    status: 'pending',
  });

export const acceptRequest = (id: string) =>
  updateDoc(doc(getFirestore(), 'friendships', id), {status: 'accepted'});

// decline, cancel a sent request, or remove a friend
export const removeFriendship = (id: string) =>
  deleteDoc(doc(getFirestore(), 'friendships', id));
