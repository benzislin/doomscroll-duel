import React, {useState} from 'react';
import {View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Blobs, ChunkyButton, FadeIn} from '../components/ui';
import {claimUsername, normalizeUsername, validUsername} from '../username';
import {C, F, SOFT} from '../theme';

export default function UsernameScreen({uid}: {uid: string}) {
  const insets = useSafeAreaInsets();
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr('');
    const u = normalizeUsername(val);
    if (!validUsername(u)) {
      setErr('3-16 characters: letters, numbers and underscores only.');
      return;
    }
    setBusy(true);
    try {
      await claimUsername(uid, u);
      // the live player snapshot updates and the app opens automatically
    } catch (e: any) {
      setErr(e?.message === 'taken' ? 'That username is taken. Try another.' : 'Could not save it. Try again.');
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: C.header}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{paddingTop: insets.top + 40, paddingBottom: 36, paddingHorizontal: 24, overflow: 'hidden'}}>
        <Blobs variant="header" />
        <Text style={s.title}>Pick a{'\n'}username</Text>
        <Text style={s.sub}>Friends will find you with it.</Text>
      </View>
      <View style={s.sheet}>
        <Blobs variant="sheet" />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding: 22}}>
          <FadeIn>
            <View style={s.inputRow}>
              <Text style={s.at}>@</Text>
              <TextInput
                style={s.input}
                placeholder="username"
                placeholderTextColor={C.muted}
                value={val}
                onChangeText={setVal}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={16}
                onSubmitEditing={submit}
              />
            </View>
            {err ? <Text style={s.err}>{err}</Text> : null}
            <ChunkyButton title={busy ? 'One sec…' : 'Continue'} onPress={submit} disabled={busy} />
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 18,
    marginBottom: 12,
    ...SOFT,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  at: {fontFamily: F.heavy, fontSize: 18, color: C.header, marginRight: 4},
  input: {flex: 1, paddingVertical: 14, fontSize: 16, fontFamily: F.semi, color: C.ink},
  err: {color: '#6F63CC', fontFamily: F.bold, marginBottom: 12},
});
