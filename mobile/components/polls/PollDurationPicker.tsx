import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

type Props = {
  minutes: number;
  hours: number;
  days: number;
  onMinutesChange: (v: number) => void;
  onHoursChange: (v: number) => void;
  onDaysChange: (v: number) => void;
};

export function PollDurationPicker({ minutes, hours, days, onMinutesChange, onHoursChange, onDaysChange }: Props) {
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const textColor = colors.text;
  const mutedColor = colors.icon;
  const borderColor = isDark ? '#2f3336' : '#e1e8ed';

  return (
    <View style={[styles.wrapper, { borderTopColor: borderColor }]}>
      <Text style={[styles.label, { color: mutedColor }]}>Duration</Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={[styles.colLabel, { color: mutedColor }]}>Days</Text>
          <Picker
            selectedValue={days}
            onValueChange={onDaysChange}
            style={[styles.picker, { color: textColor }]}
            dropdownIconColor={mutedColor}
            itemStyle={{ color: textColor }}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <Picker.Item key={i} label={String(i)} value={i} color={textColor} />
            ))}
          </Picker>
        </View>

        <View style={styles.col}>
          <Text style={[styles.colLabel, { color: mutedColor }]}>Hours</Text>
          <Picker
            selectedValue={hours}
            onValueChange={onHoursChange}
            style={[styles.picker, { color: textColor }]}
            dropdownIconColor={mutedColor}
            itemStyle={{ color: textColor }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <Picker.Item key={i} label={String(i)} value={i} color={textColor} />
            ))}
          </Picker>
        </View>

        <View style={styles.col}>
          <Text style={[styles.colLabel, { color: mutedColor }]}>Minutes</Text>
          <Picker
            selectedValue={minutes}
            onValueChange={onMinutesChange}
            style={[styles.picker, { color: textColor }]}
            dropdownIconColor={mutedColor}
            itemStyle={{ color: textColor }}
          >
            {Array.from({ length: 60 }, (_, i) => (
              <Picker.Item key={i} label={String(i)} value={i} color={textColor} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

export function pollDurationToMinutes(minutes: number, hours: number, days: number): number {
  const total = days * 24 * 60 + hours * 60 + minutes;
  return total < 1 ? 1 : total;
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  colLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  picker: {
    width: '100%',
  },
});