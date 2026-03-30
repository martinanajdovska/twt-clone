import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const MENTION_REGEX = /@(\w+)/g;

type Props = {
  content: string;
  textStyle: { color: string }[];
  baseStyle?: object;
};


export function TweetContent({ content, textStyle, baseStyle }: Props) {
  const router = useRouter();

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);

  while ((match = re.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Text key={`t-${lastIndex}`} style={[styles.base, baseStyle, ...textStyle]}>
          {content.slice(lastIndex, match.index)}
        </Text>
      );
    }
    const mentionUsername = match[1];
    parts.push(
      <TouchableOpacity
        key={`m-${match.index}`}
        onPress={(e) => {
          e.stopPropagation?.();
          router.push(`/(main)/users/${mentionUsername}` as any);
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.base, styles.mention, baseStyle, ...textStyle]}>
          @{mentionUsername}
        </Text>
      </TouchableOpacity>
    );
    lastIndex = re.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push(
      <Text key={`t-${lastIndex}`} style={[styles.base, baseStyle, ...textStyle]}>
        {content.slice(lastIndex)}
      </Text>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {parts.length > 0 ? parts : <Text style={[styles.base, baseStyle, ...textStyle]}>{content}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  base: {
    fontSize: 15,
    lineHeight: 22,
  },
  mention: {
    color: '#1d9bf0',
    fontWeight: '600',
  },
});
