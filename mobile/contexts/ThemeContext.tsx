import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@twt/colorSchemePreference';

export type ColorSchemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  /** Resolved scheme: 'light' or 'dark' (for 'system' we use the device preference) */
  colorScheme: 'light' | 'dark';
  /** User preference: light, dark, or system */
  preference: ColorSchemePreference;
  setPreference: (pref: ColorSchemePreference) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [preference, setPreferenceState] = useState<ColorSchemePreference>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
      setLoaded(true);
    });
  }, []);

  const setPreference = useCallback((pref: ColorSchemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(THEME_KEY, pref);
  }, []);

  const resolved: 'light' | 'dark' =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const value: ThemeContextValue = {
    colorScheme: loaded ? resolved : (systemScheme === 'dark' ? 'dark' : 'light'),
    preference,
    setPreference,
    isDark: loaded ? resolved === 'dark' : systemScheme === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    const system = useRNColorScheme();
    return {
      colorScheme: (system === 'dark' ? 'dark' : 'light') as 'light' | 'dark',
      preference: 'system' as ColorSchemePreference,
      setPreference: () => {},
      isDark: system === 'dark',
    };
  }
  return ctx;
}
