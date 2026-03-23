import { useTheme } from '@/contexts/ThemeContext';

/**
 * Web: use theme from ThemeContext (same as native) so theme toggling works.
 */
export function useColorScheme(): 'light' | 'dark' | null {
  return useTheme().colorScheme;
}
