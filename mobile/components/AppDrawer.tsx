import React from 'react';
import {
    View, StyleSheet, Modal, Animated, Pressable, Text, Switch, TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useDrawer } from '@/contexts/DrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { fetchSelf } from '@/api/users';
import { apiJson } from '@/lib/api';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export function AppDrawer() {
    const { colorScheme, isDark, setPreference } = useTheme();
    const colors = Colors[colorScheme];
    const { drawerVisible, closeDrawer, drawerX, drawerOverlayOpacity } = useDrawer();
    const { clearToken } = useAuth();

    const borderColor = isDark ? '#3d4146' : '#d8dde1';
    const textColor = colors.text;
    const mutedColor = colors.icon;
    const drawerBg = colors.background;

    const { data: self } = useQuery({ queryKey: ['self'], queryFn: fetchSelf });

    const handleLogout = async () => {
        closeDrawer(async () => {
            try { await apiJson('/auth/logout', { method: 'POST' }); } catch { }
            await clearToken();
            router.replace('/(auth)/login');
        });
    };

    return (
        <Modal visible={drawerVisible} transparent animationType="none" onRequestClose={() => closeDrawer()}>
            <Animated.View style={[styles.drawerOverlay, { opacity: drawerOverlayOpacity }]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => closeDrawer()} />
            </Animated.View>

            <Animated.View style={[styles.drawer, { backgroundColor: drawerBg, transform: [{ translateX: drawerX }] }]}>
                <View style={styles.drawerUser}>
                    {self?.profilePicture ? (
                        <Image source={{ uri: self.profilePicture }} style={styles.drawerAvatar} />
                    ) : (
                        <View style={[styles.drawerAvatar, { backgroundColor: '#536471', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 22 }}>
                                {self?.username.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <Text style={[styles.drawerUsername, { color: textColor }]}>{self?.username}</Text>
                    <Text style={[styles.drawerHandle, { color: mutedColor }]}>@{self?.username.toLowerCase()}</Text>
                </View>

                <View style={[styles.drawerDivider, { backgroundColor: borderColor }]} />

                <TouchableOpacity
                    style={styles.drawerItem}
                    onPress={() => closeDrawer(() => router.push(`/(tabs)/users/${self?.username}`))}
                >
                    <MaterialIcons name="person-outline" size={24} color={textColor} />
                    <Text style={[styles.drawerItemText, { color: textColor }]}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.drawerItem}
                    onPress={() => closeDrawer(() => router.push('/(tabs)/bookmarks' as any))}
                >
                    <MaterialIcons name="bookmark-outline" size={24} color={textColor} />
                    <Text style={[styles.drawerItemText, { color: textColor }]}>Bookmarks</Text>
                </TouchableOpacity>
                <View style={styles.drawerItem}>
                    <MaterialIcons name={isDark ? 'dark-mode' : 'light-mode'} size={24} color={textColor} />
                    <Text style={[styles.drawerItemText, { color: textColor }]}>Dark mode</Text>
                    <Switch
                        value={isDark}
                        onValueChange={(val) => setPreference(val ? 'dark' : 'light')}
                        trackColor={{ false: '#cfd9de', true: '#1d9bf0' }}
                        thumbColor="#fff"
                        style={{ marginLeft: 'auto' }}
                    />
                </View>

                <View style={[styles.drawerDivider, { backgroundColor: borderColor }]} />

                <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={24} color="#f91880" />
                    <Text style={[styles.drawerItemText, { color: '#f91880' }]}>Log out</Text>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    drawerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    drawer: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0,
        width: 250,
        paddingTop: 60,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 16,
    },
    drawerUser: { paddingHorizontal: 20, paddingBottom: 20 },
    drawerAvatar: { width: 48, height: 48, borderRadius: 24, marginBottom: 12 },
    drawerUsername: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
    drawerHandle: { fontSize: 15 },
    drawerDivider: { height: StyleSheet.hairlineWidth, marginVertical: 8 },
    drawerItem: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        paddingHorizontal: 20, paddingVertical: 14,
    },
    drawerItemText: { fontSize: 18, fontWeight: '600', flex: 1 },
});