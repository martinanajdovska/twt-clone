import { useTheme } from '@/contexts/ThemeContext';

/** Returns the resolved color scheme (light/dark) from theme preference or system. */
export function useColorScheme(): 'light' | 'dark' | null {
  return useTheme().colorScheme;
}
