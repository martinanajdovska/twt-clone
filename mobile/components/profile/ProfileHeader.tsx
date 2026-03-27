import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import type { IProfileHeader as ProfileHeaderType } from '@/types/profile';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useToggleFollow } from '@/hooks/users/useToggleFollow';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function formatJoined(iso: string): string {
  try {
    return `Joined ${new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  } catch {
    return '';
  }
}

function formatBirthday(iso: string): string {
  try {
    const d = new Date(iso);
    return `Born ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
  } catch {
    return '';
  }
}

function normalizeWebsite(raw: string): { display: string; href: string } {
  const trimmed = raw.trim();
  const display = trimmed.replace(/^https?:\/\//i, '');
  const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return { display, href };
}

export function ProfileHeader({
  profile,
  isSelf,
}: {
  profile: ProfileHeaderType;
  isSelf: boolean;
}) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { mutateAsync: toggleFollowMutation, isPending: isTogglingFollow } =
    useToggleFollow();

  const handleFollow = async () => {
    try {
      await toggleFollowMutation({
        username: profile.username,
        isFollowed: profile.isFollowed,
      });
    } catch {
      Alert.alert('Error', 'Failed to update follow');
    }
  };

  const displayName = profile.displayName?.trim() || profile.username;
  const joined = formatJoined(profile.createdAt);
  const birthday = profile.birthday ? formatBirthday(profile.birthday) : '';
  const website = useMemo(
    () => (profile.website ? normalizeWebsite(profile.website) : null),
    [profile.website],
  );

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.banner,
          profile.bannerUrl ? { backgroundColor: 'transparent' } : {},
        ]}>
        {profile.bannerUrl && (
          <Image source={{ uri: profile.bannerUrl }} style={StyleSheet.absoluteFill} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatarWrap, { borderColor: colors.background }]}>
            {profile.imageUrl ? (
              <Image source={{ uri: profile.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
          </View>
          {isSelf ? (
            <TouchableOpacity
              style={[styles.followBtn, { borderColor: colors.icon, backgroundColor: 'transparent' }]}
              onPress={() => router.push('/(tabs)/users/edit' as any)}>
              <ThemedText style={[styles.followBtnText, { color: colors.text }]}>Edit profile</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.followBtn,
                {
                  borderColor: profile.isFollowed ? '#1d9bf0' : 'transparent',
                  backgroundColor: profile.isFollowed ? 'transparent' : '#1d9bf0',
                  opacity: isTogglingFollow ? 0.6 : 1,
                },
              ]}
              disabled={isTogglingFollow}
              onPress={handleFollow}>
              <ThemedText
                style={[
                  styles.followBtnText,
                  { color: profile.isFollowed ? '#1d9bf0' : '#fff' },
                ]}>
                {profile.isFollowed ? 'Unfollow' : 'Follow'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <ThemedText type="title" style={styles.displayName}>
          {displayName}
        </ThemedText>
        <ThemedText style={[styles.handle, { color: colors.icon }]}>@{profile.username}</ThemedText>
        {profile.isFollowingYou && !isSelf && (
          <ThemedText style={styles.followsYou}>Follows you</ThemedText>
        )}
        {profile.bio && <ThemedText style={styles.bio}>{profile.bio}</ThemedText>}
        <View style={styles.meta}>
          {profile.location && (
            <View style={styles.metaRow}>
              <MaterialIcons name="location-on" size={16} color={colors.icon} />
              <ThemedText style={styles.metaText}>{profile.location}</ThemedText>
            </View>
          )}
          {website && (
            <TouchableOpacity
              style={styles.metaRow}
              onPress={async () => {
                try {
                  const can = await Linking.canOpenURL(website.href);
                  if (can) await Linking.openURL(website.href);
                } catch {
                  // ignore
                }
              }}
            >
              <MaterialIcons name="link" size={16} color={colors.icon} />
              <ThemedText style={[styles.metaText, { color: colors.tint }]}>
                {website.display}
              </ThemedText>
            </TouchableOpacity>
          )}
          {birthday && (
            <View style={styles.metaRow}>
              <MaterialIcons name="cake" size={16} color={colors.icon} />
              <ThemedText style={styles.metaText}>{birthday}</ThemedText>
            </View>
          )}
          {joined && (
            <View style={styles.metaRow}>
              <MaterialIcons name="calendar-today" size={16} color={colors.icon} />
              <ThemedText style={styles.metaText}>{joined}</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.counts}>
          <ThemedText type="defaultSemiBold">{profile.following}</ThemedText>
          <ThemedText style={[styles.countLabel, { color: colors.icon }]}> Following</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ marginLeft: 16 }}>{profile.followers}</ThemedText>
          <ThemedText style={[styles.countLabel, { color: colors.icon }]}> Followers</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.2)' },
  banner: { height: 160, width: '100%', backgroundColor: 'rgba(128,128,128,0.2)' },
  content: { paddingHorizontal: 16, paddingBottom: 16 },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -50 },
  avatarWrap: { borderWidth: 4, borderRadius: 50, overflow: 'hidden', marginTop: 10 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { backgroundColor: '#888' },
  followBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  followBtnText: { fontSize: 15, fontWeight: '600' },
  displayName: { marginTop: 12 },
  handle: { marginTop: 2, fontSize: 15 },
  followsYou: { marginTop: 4, fontSize: 12, opacity: 0.8 },
  bio: { marginTop: 12 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 14 },
  counts: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  countLabel: { fontSize: 14 },
});