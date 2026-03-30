import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeStore {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  resolve: () => void;
}

function getAutoTheme(): 'light' | 'dark' {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 19 ? 'light' : 'dark';
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: 'dark' as ThemeMode,
      resolved: 'dark' as 'light' | 'dark',
      setMode: (mode: ThemeMode) => {
        const resolved = mode === 'auto' ? getAutoTheme() : mode;
        set({ mode, resolved });
        applyTheme(resolved);
      },
      resolve: () => {
        const { mode } = get();
        const resolved = mode === 'auto' ? getAutoTheme() : mode;
        set({ resolved });
        applyTheme(resolved);
      },
    }),
    {
      name: 'pitchiq-theme',
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);

function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
}
