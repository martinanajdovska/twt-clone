import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { PollDurationPicker } from '@/components/polls/PollDurationPicker';

type Props = {
  pollOptions: string[];
  updateOption: (index: number, value: string) => void;
  removeOption: (index: number) => void;
  addOption: () => void;
  MIN_POLL_OPTIONS: number;
  MAX_POLL_OPTIONS: number;

  pollDurationMinutes: number;
  pollDurationHours: number;
  pollDurationDays: number;
  setPollDurationMinutes: (v: number) => void;
  setPollDurationHours: (v: number) => void;
  setPollDurationDays: (v: number) => void;

  borderColor: string;
  textColor: string;
  mutedColor: string;
  inputBg: string;
};

export const PollBuilder = ({
  pollOptions,
  updateOption,
  removeOption,
  addOption,
  MIN_POLL_OPTIONS,
  MAX_POLL_OPTIONS,
  pollDurationMinutes,
  pollDurationHours,
  pollDurationDays,
  setPollDurationMinutes,
  setPollDurationHours,
  setPollDurationDays,
  borderColor,
  textColor,
  mutedColor,
  inputBg,
}: Props) => {
  return (
    <View style={[styles.container, { borderColor }]}>
      {pollOptions.map((option, index) => (
        <View key={index} style={[styles.optionRow, { borderColor }]}>
          <TextInput
            style={[styles.input, { color: textColor, backgroundColor: inputBg }]}
            placeholder={`Choice ${index + 1}`}
            placeholderTextColor={mutedColor}
            value={option}
            onChangeText={(v) => updateOption(index, v)}
            maxLength={25}
          />

          {pollOptions.length > MIN_POLL_OPTIONS && (
            <TouchableOpacity onPress={() => removeOption(index)} hitSlop={8}>
              <MaterialIcons name="close" size={18} color={mutedColor} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {pollOptions.length < MAX_POLL_OPTIONS && (
        <TouchableOpacity
          style={[styles.addBtn, { borderColor }]}
          onPress={addOption}
        >
          <MaterialIcons name="add" size={18} color="#1d9bf0" />
          <Text style={styles.addText}>Add choice</Text>
        </TouchableOpacity>
      )}

      <PollDurationPicker
        minutes={pollDurationMinutes}
        hours={pollDurationHours}
        days={pollDurationDays}
        onMinutesChange={setPollDurationMinutes}
        onHoursChange={setPollDurationHours}
        onDaysChange={setPollDurationDays}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  addText: {
    fontSize: 15,
    color: '#1d9bf0',
    fontWeight: '500',
  },
});