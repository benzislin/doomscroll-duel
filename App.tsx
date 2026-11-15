import React, {useEffect, useMemo, useRef, useState} from 'react';
import {AppState, NativeModules, StatusBar, Text, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {getAuth, signOut} from '@react-native-firebase/auth';
import {getFirestore, doc, getDoc, setDoc} from '@react-native-firebase/firestore';
import {TabBar} from './components/TabBar';
import type {Tab} from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import BattlesScreen from './screens/BattlesScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import UsernameScreen from './screens/UsernameScreen';
import {usePlayers} from './usePlayers';
import {useUsagePermission} from './useUsagePermission';
import {useAuth} from './useAuth';
import {useFriendships} from './useFriendships';
import FriendsScreen from './screens/FriendsScreen';
import {FriendsButton} from './components/FriendsButton';
import type {AuthUser} from './useAuth';
import {syncUsage} from './sync';
import {buildColorMap, totalMinutes} from './usage';
import {C} from './theme';
import {applyFonts} from './fonts';
import {dayKey} from './history';
import GoalScreen from './screens/GoalScreen';
import {useBattles, createBattle, acceptBattle, deleteBattle, updateBattle} from './battle';

applyFonts();

const SYNC_EVERY_MS = 60000;
const OLD_MOCK_IDS = ['me', 'friend', 'jordan'];

function Splash({children}: {children: React.ReactNode}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bg,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      }}>
      {children}
    </View>
  );
}

function Root({user}: {user: AuthUser}) {
  const all = usePlayers();
  const granted = useUsagePermission();
  const [tab, setTab] = useState<Tab>('home');
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState('');
  const [syncedAt, setSyncedAt] = useState(0);
  const [showFriends, setShowFriends] = useState(false);
  const friendships = useFriendships(user.uid);
  const battles = useBattles(user.uid);

  const players = useMemo(
    () =>
      all
        ? all
            .filter(p => !OLD_MOCK_IDS.includes(p.id))
            .map(p => ({...p, apps: p.apps ?? []}))
        : null,
    [all],
  );
  const colors = useMemo(() => buildColorMap(players ?? []), [players]);
  const me = players ? players.find(p => p.id === user.uid) : undefined;
  const meRef = useRef(me);
  meRef.current = me;
  const busy = useRef(false);
  const hasMe = !!me;

  // Make sure this account has a player doc (never overwrites an existing one).
  const listLoaded = players !== null;
  useEffect(() => {
    if (!listLoaded || hasMe) {
      return;
    }
    (async () => {
      try {
        const ref = doc(getFirestore(), 'players', user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          const cur: any = getAuth().currentUser;
          const name =
            cur?.displayName || user.displayName || (user.email ?? 'Player').split('@')[0];
          await setDoc(ref, {id: user.uid, name, apps: []}, {merge: true});
        }
      } catch (e) {
        // the snapshot listener will pick it up once it exists
      }
    })();
  }, [listLoaded, hasMe, user.uid, user.displayName, user.email]);

  // Auto-sync real usage to this account's doc.
  useEffect(() => {
    if (!granted || !hasMe) {
      return;
    }
    let alive = true;
    const run = async () => {
      const p = meRef.current;
      if (!p || busy.current) {
        return;
      }
      busy.current = true;
      setSyncing(true);
      try {
        await syncUsage(p);
        if (alive) {
          const t = new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
          setStatus(`Synced at ${t}`);
          setSyncedAt(Date.now());
        }
      } catch (e) {
        if (alive) {
          setStatus('Sync failed, retrying…');
        }
      } finally {
        busy.current = false;
        if (alive) {
          setSyncing(false);
        }
      }
    };
    run();
    const id = setInterval(run, SYNC_EVERY_MS);
    const sub = AppState.addEventListener('change', st => {
      if (st === 'active') {
        run();
      }
    });
    return () => {
      alive = false;
      clearInterval(id);
      sub.remove();
    };
  }, [granted, hasMe, user.uid]);

  const myTotal = me ? totalMinutes(me) : 0;
  const myApps: Record<string, number> = {};
  (me?.apps ?? []).forEach(x => {
    myApps[x.name] = (myApps[x.name] ?? 0) + x.minutes;
  });
  useEffect(() => {
    if (!syncedAt || !hasMe) {
      return;
    }
    setDoc(
      doc(getFirestore(), 'players', user.uid),
      {history: {[dayKey()]: myTotal}, daily: {[dayKey()]: myApps}},
      {merge: true},
    ).catch(() => {});
  }, [syncedAt, myTotal, hasMe, user.uid]);

  if (players === null || !me) {
    return (
      <Splash>
        <Text style={{color: C.muted, fontWeight: '800'}}>Loading…</Text>
      </Splash>
    );
  }

  const onGoal = (m: number) =>
    setDoc(doc(getFirestore(), 'players', user.uid), {goalMinutes: m}, {merge: true});

  if (!(me as any).username) {
    return <UsernameScreen uid={user.uid} />;
  }

  if ((me as any).goalMinutes == null) {
    return <GoalScreen onDone={onGoal} />;
  }

  const onGrant = () => NativeModules.UsageStats.openSettings();
  const friendIds = friendships
    .filter(f => f.status === 'accepted')
    .map(f => (f.from === user.uid ? f.to : f.from));
  const battlePlayers = players.filter(p => p.id === me.id || friendIds.includes(p.id));
  const requestCount = friendships.filter(
    f => f.status === 'pending' && f.to === user.uid,
  ).length;
  const battleBadge = battles.filter(b => b.status === 'pending' && b.to === user.uid).length;
  const goTab = (t: Tab) => {
    setShowFriends(false);
    setTab(t);
  };

  return (
    <View style={{flex: 1, backgroundColor: C.header}}>
      <StatusBar barStyle="light-content" />
      {showFriends ? (
        <FriendsScreen
          me={me}
          players={players}
          friendships={friendships}
          onBack={() => setShowFriends(false)}
        />
      ) : null}
      {!showFriends && tab === 'home' && (
        <HomeScreen
          me={me}
          friends={battlePlayers}
          colors={colors}
          granted={granted}
          syncing={syncing}
          status={status}
          onGoal={onGoal}
          onGrant={onGrant}
        />
      )}
      {!showFriends && tab === 'battles' && (
        <BattlesScreen
          me={me}
          players={battlePlayers}
          colors={colors}
          battles={battles}
          onChallenge={(opp, o) => createBattle(user.uid, opp.id, o)}
          onAccept={acceptBattle}
          onDelete={deleteBattle}
          onEdit={(b, o) => updateBattle(b.id, o)}
        />
      )}
      {!showFriends && tab === 'profile' && (
        <ProfileScreen
          me={me}
          email={user.email}
          granted={granted}
          goal={(me as any).goalMinutes}
          onGoal={onGoal}
          friendCount={friendIds.length}
          requestCount={requestCount}
          onOpenFriends={() => setShowFriends(true)}
          onGrant={onGrant}
          onLogout={() => signOut(getAuth())}
        />
      )}
      {!showFriends ? (
        <FriendsButton count={requestCount} onPress={() => setShowFriends(true)} />
      ) : null}
      <TabBar tab={tab} onChange={goTab} badges={{battles: battleBadge}} />
    </View>
  );
}

function Gate() {
  const {user, ready} = useAuth();
  if (!ready) {
    return (
      <Splash>
        <Text style={{color: C.muted, fontWeight: '800'}}>Loading…</Text>
      </Splash>
    );
  }
  if (!user) {
    return (
      <>
        <StatusBar barStyle="light-content" />
        <AuthScreen />
      </>
    );
  }
  // key = uid so all state resets cleanly when switching accounts
  return <Root key={user.uid} user={user} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Gate />
    </SafeAreaProvider>
  );
}
