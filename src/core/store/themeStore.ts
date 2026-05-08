import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ThemeService } from '../services/themeService';

type Theme = 'light' | 'dark';

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
    devtools(
        (set) => ({
            theme: ThemeService.getInitial(),

            toggleTheme: () => set((state) => {
                const next: Theme = state.theme === 'light' ? 'dark' : 'light';
                ThemeService.apply(next);
                return { theme: next };
            }, false, 'theme/toggle'),

            setTheme: (theme) => set(() => {
                ThemeService.apply(theme);
                return { theme };
            }, false, 'theme/set'),
        }),
        { name: 'ThemeStore' }
    )
);

// Appliquer le theme au chargement du store (avant le premier render)
ThemeService.apply(ThemeService.getInitial());
