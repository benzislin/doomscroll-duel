import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet} from 'react-native';
import {Player} from '../mockData';
import {Shell, Card, Avatar, ChunkyButton, FadeIn} from '../components/ui';
import {
  Friendship,
  sendRequest,
  acceptRequest,
  removeFriendship,
} from '../useFriendships';
import {C, F} from '../theme';

type Props = {
  me: Player;
  players: Player[];
  friendships: Friendship[];
  onBack: () => void;
};

function Pill({label, onPress, solid}: {label: string; onPress: () => void; solid?: boolean}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.pill, solid ? {backgroundColor: C.header} : {backgroundColor: '#E4DEF8'}]}>
      <Text style={[s.pillText, {color: solid ? '#fff' : C.header}]}>{label}</Text>
    </Pressable>
  );
}

function Row({p, children}: {p?: Player; children: React.ReactNode}) {
  return (
    <View style={s.row}>
      <Avatar name={p?.name ?? '?'} size={42} />
      <View style={{flex: 1, marginLeft: 12}}>
        <Text style={s.name} numberOfLines={1}>
          {p?.name ?? 'Unknown'}
        </Text>
        {(p as any)?.username ? <Text style={s.handle}>@{(p as any).username}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export default function FriendsScreen({me, players, friendships, onBack}: Props) {
  const [uname, setUname] = useState('');
  const [msg, setMsg] = useState('');
  const byId = (id: string) => players.find(p => p.id === id);
  const other = (f: Friendship) => (f.from === me.id ? f.to : f.from);

  const incoming = friendships.filter(f => f.status === 'pending' && f.to === me.id);
  const outgoing = friendships.filter(f => f.status === 'pending' && f.from === me.id);
  const friends = friendships.filter(f => f.status === 'accepted');

  const add = async () => {
    const un = uname.trim().replace(/^@/, '').toLowerCase();
    if (!un) {
      return;
    }
    const target = players.find(p => ((p as any).username ?? '') === un);
    if (!target) {
      setMsg('No player with that username.');
      return;
    }
    if (target.id === me.id) {
      setMsg("That's you!");
      return;
    }
    const ex = friendships.find(f => f.users.includes(target.id));
    if (ex?.status === 'accepted') {
      setMsg(`You're already friends with ${target.name}.`);
    } else if (ex && ex.from === me.id) {
      setMsg(`You already sent ${target.name} a request.`);
    } else if (ex) {
      setMsg(`${target.name} already sent you a request. Accept it below.`);
    } else {
      try {
        await sendRequest(me.id, target.id);
        setMsg(`Request sent to ${target.name}.`);
        setUname('');
      } catch (e) {
        setMsg('Could not send the request. Try again.');
      }
    }
  };

  return (
    <Shell title="Friends" subtitle={`${friends.length} friend${friends.length === 1 ? '' : 's'}`} onBack={onBack}>
      <Card>
        <Text style={s.h}>Add a friend</Text>
        <TextInput
          style={s.input}
          placeholder="Their username"
          placeholderTextColor={C.muted}
          value={uname}
          onChangeText={setUname}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={add}
        />
        {msg ? <Text style={s.msg}>{msg}</Text> : null}
        <ChunkyButton title="Send request" onPress={add} />
      </Card>

      {incoming.length > 0 ? (
        <FadeIn>
          <Card>
            <Text style={s.h}>Requests</Text>
            {incoming.map(f => (
              <Row key={f.id} p={byId(other(f))}>
                <Pill label="Accept" solid onPress={() => acceptRequest(f.id)} />
                <View style={{width: 8}} />
                <Pill label="Decline" onPress={() => removeFriendship(f.id)} />
              </Row>
            ))}
          </Card>
        </FadeIn>
      ) : null}

      <Card>
        <Text style={s.h}>Your friends</Text>
        {friends.length === 0 ? (
          <Text style={s.empty}>No friends yet. Add one by username above.</Text>
        ) : (
          friends.map(f => (
            <Row key={f.id} p={byId(other(f))}>
              <Pill label="Remove" onPress={() => removeFriendship(f.id)} />
            </Row>
          ))
        )}
      </Card>

      {outgoing.length > 0 ? (
        <Card>
          <Text style={s.h}>Sent</Text>
          {outgoing.map(f => (
            <Row key={f.id} p={byId(other(f))}>
              <Text style={s.pending}>Pending</Text>
              <View style={{width: 8}} />
              <Pill label="Cancel" onPress={() => removeFriendship(f.id)} />
            </Row>
          ))}
        </Card>
      ) : null}
    </Shell>
  );
}

const s = StyleSheet.create({
  h: {fontFamily: F.heavy, fontSize: 17, color: C.ink, marginBottom: 12},
  input: {
    backgroundColor: C.bg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: F.semi,
    color: C.ink,
    marginBottom: 10,
  },
  msg: {fontFamily: F.bold, color: C.header, marginBottom: 10},
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  name: {fontFamily: F.bold, fontSize: 16, color: C.ink},
  handle: {fontFamily: F.semi, fontSize: 12, color: C.muted},
  pill: {paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14},
  pillText: {fontFamily: F.heavy, fontSize: 13},
  pending: {fontFamily: F.semi, color: C.muted, fontSize: 13},
  empty: {fontFamily: F.semi, color: C.muted},
});
