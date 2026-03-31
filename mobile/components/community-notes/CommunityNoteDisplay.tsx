import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { ICommunityNoteDisplay } from '@/types/community-notes';
import { useRateNote } from '@/hooks/community-notes/useRateNote';

export function CommunityNoteDisplay({
  note,
  tweetId,
}: {
  note: ICommunityNoteDisplay | null;
  tweetId: number;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedRating, setSelectedRating] = useState<boolean | null>(note?.isHelpful ?? null);

  const rateNoteMutation = useRateNote(tweetId, note?.id ?? 0);

  useEffect(() => {
    setSelectedRating(note?.isHelpful ?? null);
  }, [note?.id, note?.isHelpful]);

  if (!note) return null;

  const borderColor = isDark ? '#3d4144' : '#cfd9de';
  const bgColor = isDark ? '#000000' : '#f7f9f9';
  const textColor = isDark ? '#e7e9ea' : '#0f1419';
  const mutedColor = isDark ? '#71767b' : '#536471';
  const linkColor = '#1d9bf0';

  const handleRate = async (helpful: boolean) => {
    setSelectedRating(helpful);

    try {
      await rateNoteMutation.mutateAsync(helpful);
    } catch {
      setSelectedRating(note.isHelpful);
    }
  };

  const isHelpful = selectedRating === true;
  const isNotHelpful = selectedRating === false;

  return (
    <View style={[styles.wrapper, { borderColor, backgroundColor: bgColor }]}>
      <Text style={[styles.label, { color: textColor }]}>Community Note</Text>
      <Text style={[styles.content, { color: textColor }]}>{note.content}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleRate(true)}
          hitSlop={8}
          style={styles.rateBtn}
          disabled={rateNoteMutation.isPending}
        >
          <Text style={[
            styles.rateText,
            { color: isHelpful ? linkColor : mutedColor },
            isHelpful && styles.rateTextBold
          ]}>
            Helpful
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleRate(false)}
          hitSlop={8}
          style={styles.rateBtn}
          disabled={rateNoteMutation.isPending}
        >
          <Text style={[
            styles.rateText,
            { color: isNotHelpful ? linkColor : mutedColor },
            isNotHelpful && styles.rateTextBold
          ]}>
            Not helpful
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  rateBtn: {},
  rateText: { fontSize: 14 },
  rateTextBold: { fontWeight: '600' },
});