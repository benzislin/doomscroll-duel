import {useEffect, useState} from 'react';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';

export type AuthUser = {uid: string; email: string | null; displayName: string | null};

// user === null and ready === true  ->  signed out
// Firebase persists the session on the device, so this stays signed in
// across app restarts until signOut() is called.
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    return onAuthStateChanged(getAuth(), (u: any) => {
      setUser(u ? {uid: u.uid, email: u.email, displayName: u.displayName} : null);
      setReady(true);
    });
  }, []);
  return {user, ready};
}
