import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated } from 'react-native';

type DrawerContextType = {
    openDrawer: () => void;
    closeDrawer: (cb?: () => void) => void;
    drawerVisible: boolean;
    drawerX: Animated.Value;
    drawerOverlayOpacity: Animated.Value;
};

const DrawerContext = createContext<DrawerContextType | null>(null);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
    const [drawerVisible, setDrawerVisible] = useState(false);
    const drawerX = useRef(new Animated.Value(-300)).current;
    const drawerOverlayOpacity = useRef(new Animated.Value(0)).current;

    const openDrawer = () => {
        setDrawerVisible(true);
        Animated.parallel([
            Animated.timing(drawerX, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.timing(drawerOverlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
    };

    const closeDrawer = (cb?: () => void) => {
        Animated.parallel([
            Animated.timing(drawerX, { toValue: -300, duration: 200, useNativeDriver: true }),
            Animated.timing(drawerOverlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            setDrawerVisible(false);
            cb?.();
        });
    };

    return (
        <DrawerContext.Provider value={{ openDrawer, closeDrawer, drawerVisible, drawerX, drawerOverlayOpacity }}>
            {children}
        </DrawerContext.Provider>
    );
}

export function useDrawer() {
    const ctx = useContext(DrawerContext);
    if (!ctx) throw new Error('useDrawer must be used within DrawerProvider');
    return ctx;
}