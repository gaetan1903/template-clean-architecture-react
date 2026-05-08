type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

export class ThemeService {
    static getStored(): Theme | null {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'light' || stored === 'dark' ? stored : null;
    }

    static persist(theme: Theme): void {
        localStorage.setItem(STORAGE_KEY, theme);
    }

    static getInitial(): Theme {
        const stored = ThemeService.getStored();
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    static apply(theme: Theme): void {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        ThemeService.persist(theme);
    }
}
