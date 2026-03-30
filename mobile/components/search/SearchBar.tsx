import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Pressable,
    Text,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;

    showDropdown?: boolean;
    dropdownLoading?: boolean;
    dropdownResults?: string[];
    onResultPress?: (item: string) => void;
    emptyMessage?: string;

    containerStyle?: ViewStyle;
    searchFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    returnKeyType?: 'search' | 'done' | 'go' | 'next' | 'send';
}

export function SearchBar({
    value,
    onChangeText,
    placeholder,
    showDropdown = false,
    dropdownLoading = false,
    dropdownResults = [],
    onResultPress,
    emptyMessage,
    containerStyle,
    searchFocused,
    onFocus,
    onBlur,
    autoCapitalize = 'none',
    returnKeyType = 'search',
}: SearchBarProps) {
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];

    const borderColor = isDark ? '#3d4146' : '#d8dde1';
    const mutedColor = colors.icon;
    const textColor = colors.text;
    const bgColor = colors.background;

    const handleClear = () => {
        onChangeText('');
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <View
                style={[
                    styles.searchInner,
                    {
                        backgroundColor: isDark ? '#1e2732' : '#eff3f4',
                        borderColor,
                    },
                ]}
            >
                <MaterialIcons name="search" size={20} color={mutedColor} />
                <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder={placeholder}
                    placeholderTextColor={mutedColor}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    autoCapitalize={autoCapitalize}
                    returnKeyType={returnKeyType}
                />
                {value.length > 0 && (
                    <TouchableOpacity onPress={handleClear} hitSlop={8}>
                        <MaterialIcons name="close" size={18} color={mutedColor} />
                    </TouchableOpacity>
                )}
            </View>

            {showDropdown && (
                <View
                    style={[
                        styles.dropdown,
                        {
                            backgroundColor: bgColor,
                            borderColor,
                        },
                    ]}
                >
                    {dropdownLoading ? (
                        <View style={styles.dropdownLoading}>
                            <ActivityIndicator size="small" color="#1d9bf0" />
                        </View>
                    ) : dropdownResults.length === 0 ? (
                        <View style={styles.dropdownEmpty}>
                            <Text style={[styles.dropdownEmptyText, { color: mutedColor }]}>
                                {emptyMessage || `No results found for "${value}"`}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={dropdownResults}
                            keyExtractor={(item, index) => `${item}-${index}`}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.userRow,
                                        {
                                            borderBottomColor: borderColor,
                                            backgroundColor: pressed ? mutedColor + '15' : undefined,
                                        },
                                    ]}
                                    onPress={() => onResultPress?.(item)}
                                >
                                    <View style={[styles.avatar, { backgroundColor: mutedColor + '25' }]}>
                                        <MaterialIcons name="person" size={22} color={mutedColor} />
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={[styles.userHandle, { color: textColor }]}>@{item}</Text>
                                        <Text style={[styles.viewProfile, { color: mutedColor }]}>
                                            Start conversation
                                        </Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={22} color={mutedColor} />
                                </Pressable>
                            )}
                            keyboardShouldPersistTaps="always"
                        />
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    searchInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 24,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 8,
        borderRadius: 12,
        borderWidth: 1,
        maxHeight: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 1000,
    },
    dropdownLoading: {
        padding: 24,
        alignItems: 'center',
    },
    dropdownEmpty: {
        padding: 24,
        alignItems: 'center',
    },
    dropdownEmptyText: {
        fontSize: 14,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        flex: 1,
    },
    userHandle: {
        fontSize: 16,
        fontWeight: '600',
    },
    viewProfile: {
        fontSize: 14,
        marginTop: 2,
    },
});