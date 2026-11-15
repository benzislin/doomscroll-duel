import React from 'react';
import {Text, View} from 'react-native';
import {Player} from '../mockData';
import {C, F} from '../theme';
import {Avatar, Card, ChunkyButton, Shell} from '../components/ui';
import {GoalPicker} from '../components/GoalPicker';

type Props = {
  me: Player;
  email: string | null;
  granted: boolean;
  goal: number;
  onGoal: (minutes: number) => void;
  friendCount: number;
  requestCount: number;
  onOpenFriends: () => void;
  onGrant: () => void;
  onLogout: () => void;
};

export default function ProfileScreen({
  me,
  email,
  granted,
  goal,
  onGoal,
  friendCount,
  requestCount,
  onOpenFriends,
  onGrant,
  onLogout,
}: Props) {
  const handle = (me as any).username;
  return (
    <Shell title="Profile" subtitle={email ?? undefined}>
      <Card>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Avatar name={me.name} size={56} />
          <View style={{marginLeft: 14, flex: 1}}>
            <Text style={{fontFamily: F.heavy, fontSize: 20, color: C.ink}}>{me.name}</Text>
            {handle ? (
              <Text style={{fontFamily: F.semi, fontSize: 13, color: C.muted}}>@{handle}</Text>
            ) : null}
          </View>
        </View>
      </Card>

      <Card>
        <Text style={{fontFamily: F.heavy, fontSize: 16, color: C.ink, marginBottom: 14}}>
          Daily screen time goal
        </Text>
        <GoalPicker value={goal} onChange={onGoal} />
      </Card>

      <Card>
        <Text style={{fontFamily: F.heavy, fontSize: 16, color: C.ink, marginBottom: 6}}>Friends</Text>
        <Text style={{fontFamily: F.semi, color: C.muted, marginBottom: 12}}>
          {friendCount} friend{friendCount === 1 ? '' : 's'}
          {requestCount > 0 ? ` · ${requestCount} new request${requestCount === 1 ? '' : 's'}` : ''}
        </Text>
        <ChunkyButton title="Add or manage friends" onPress={onOpenFriends} />
      </Card>

      <Card>
        <Text style={{fontFamily: F.heavy, fontSize: 16, color: C.ink, marginBottom: 6}}>Usage access</Text>
        <Text style={{fontFamily: F.semi, color: C.muted, marginBottom: 12}}>
          {granted
            ? 'On. Your real screen time syncs automatically.'
            : 'Off. Grant it so the app can read your real screen time.'}
        </Text>
        {!granted ? <ChunkyButton title="Grant usage access" onPress={onGrant} /> : null}
      </Card>

      <ChunkyButton title="Sign out" onPress={onLogout} color={C.navy} />
    </Shell>
  );
}
