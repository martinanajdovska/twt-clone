import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { useRateNote } from '@/hooks/community-notes/useRateNote';
import type { IAllNoteItem } from '@/types/community-notes';

export function NoteCard({
  note,
  tweetId,
}: {
  note: IAllNoteItem;
  tweetId: number;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedRating, setSelectedRating] = useState<boolean | null>(note.isHelpful ?? null);

  const rateNoteMutation = useRateNote(tweetId, note?.id ?? 0);


  useEffect(() => {
    setSelectedRating(note.isHelpful ?? null);
  }, [note.id, note.isHelpful]);

  const borderColor = note.isVisible
    ? isDark ? '#6b5a30' : '#d4a83b'
    : isDark ? '#2f3336' : '#eff3f4';
  const bgColor = note.isVisible
    ? isDark ? '#2d2a1f' : '#fef9e7'
    : isDark ? '#000000' : '#f7f9f9';
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

  return (
    <View style={[styles.card, { borderColor, backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.author, { color: mutedColor }]}>@{note.authorUsername}</Text>
        <View style={[styles.badge, note.isVisible ? (isDark ? styles.badgeVisibleDark : styles.badgeVisibleLight) : { backgroundColor: isDark ? '#38444d' : '#e1e8ed' }]}>
          <Text style={[styles.badgeText, { color: note.isVisible ? (isDark ? '#d4a83b' : '#7d6b2e') : mutedColor }]}>
            {note.isVisible ? 'Visible' : 'Pending'}
          </Text>
        </View>
      </View>
      <Text style={[styles.content, { color: textColor }]}>{note.content}</Text>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => handleRate(true)} hitSlop={8}>
          <Text style={[styles.footerLink, { color: selectedRating === true ? linkColor : mutedColor }, selectedRating === true && styles.footerLinkBold]}>
            Helpful
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleRate(false)} hitSlop={8}>
          <Text style={[styles.footerLink, { color: selectedRating === false ? linkColor : mutedColor }, selectedRating === false && styles.footerLinkBold]}>
            Not helpful
          </Text>
        </TouchableOpacity>
        <Text style={[styles.counts, { color: mutedColor }]}>
          {note.helpfulCount} helpful · {note.notHelpfulCount} not helpful
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  author: { fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeVisibleLight: { backgroundColor: '#fef3c7' },
  badgeVisibleDark: { backgroundColor: '#3d3520' },
  badgeText: { fontSize: 12, fontWeight: '500' },
  content: { fontSize: 15, lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  footerLink: { fontSize: 14 },
  footerLinkBold: { fontWeight: '600' },
  counts: { fontSize: 13 },
});
