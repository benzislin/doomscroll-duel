import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from '@react-native-firebase/auth';
import {getFirestore, doc, setDoc} from '@react-native-firebase/firestore';
import {Blobs, ChunkyButton, FadeIn} from '../components/ui';
import {C, F, SOFT} from '../theme';

function friendly(e: any): string {
  switch (e?.code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/email-already-in-use':
      return 'An account with that email already exists. Try signing in.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.';
    case 'auth/network-request-failed':
      return 'No connection. Check your internet and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.';
    default:
      return 'Something went wrong: ' + String(e?.code ?? e?.message ?? e);
  }
}

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    setErr('');
    const em = email.trim();
    const nm = name.trim();
    if (!em || !pw) {
      setErr('Enter your email and password.');
      return;
    }
    if (mode === 'up' && !nm) {
      setErr('Pick a display name.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'up') {
        const cred = await createUserWithEmailAndPassword(getAuth(), em, pw);
        await updateProfile(cred.user, {displayName: nm});
        await setDoc(
          doc(getFirestore(), 'players', cred.user.uid),
          {id: cred.user.uid, name: nm, apps: [], email: em.toLowerCase()},
          {merge: true},
        );
      } else {
        await signInWithEmailAndPassword(getAuth(), em, pw);
      }
      // onAuthStateChanged in useAuth takes it from here.
    } catch (e) {
      setErr(friendly(e));
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: C.header}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{paddingTop: insets.top + 40, paddingBottom: 36, paddingHorizontal: 24, overflow: 'hidden'}}>
        <Blobs variant="header" />
        <Text style={s.title}>Screentime{'\n'}Battle</Text>
        <Text style={s.sub}>Lowest screen time wins.</Text>
      </View>
      <View style={s.sheet}>
        <Blobs variant="sheet" />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding: 22, paddingBottom: 60}}>
          <FadeIn>
            <Text style={s.h}>{mode === 'in' ? 'Welcome back' : 'Create your account'}</Text>
            {mode === 'up' ? (
              <TextInput
                style={s.input}
                placeholder="Display name"
                placeholderTextColor={C.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                maxLength={20}
              />
            ) : null}
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor={C.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={C.muted}
              value={pw}
              onChangeText={setPw}
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={submit}
            />
            {err ? <Text style={s.err}>{err}</Text> : null}
            <ChunkyButton
              title={busy ? 'One sec…' : mode === 'in' ? 'Sign in' : 'Create account'}
              onPress={submit}
              disabled={busy}
            />
            <Pressable
              onPress={() => {
                setMode(mode === 'in' ? 'up' : 'in');
                setErr('');
              }}
              style={{marginTop: 18}}>
              <Text style={s.switch}>
                {mode === 'in' ? "New here? Create an account" : 'Have an account? Sign in'}
              </Text>
            </Pressable>
          </FadeIn>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  title: {color: '#fff', fontSize: 38, fontFamily: F.heavy, letterSpacing: -1, lineHeight: 42},
  sub: {color: '#D9D4FF', fontSize: 15, marginTop: 8, fontFamily: F.semi},
  sheet: {flex: 1, backgroundColor: C.bg, borderTopLeftRadius: 34, borderTopRightRadius: 34, overflow: 'hidden'},
  h: {fontFamily: F.heavy, fontSize: 22, color: C.ink, marginBottom: 16},
  input: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: F.semi,
    color: C.ink,
    marginBottom: 12,
    ...SOFT,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  err: {color: '#6F63CC', fontFamily: F.bold, marginBottom: 12},
  switch: {textAlign: 'center', color: C.header, fontFamily: F.bold, fontSize: 15},
});
