import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { useThemeStore } from '../store/themeStore';
import { useAuth } from '../hooks/useAuth';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
        'text-sm font-medium px-3 py-1.5 rounded-md transition-colors',
        isActive
            ? 'bg-[rgb(var(--brand)/0.1)] text-[rgb(var(--brand))]'
            : 'text-secondary hover:text-primary hover:bg-[rgb(var(--bg-border)/0.5)]',
    ].join(' ');

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    // Selecteurs individuels Zustand pour eviter les re-renders inutiles
    const theme = useThemeStore((s) => s.theme);
    const toggleTheme = useThemeStore((s) => s.toggleTheme);
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col page-bg">
            {/* Topbar */}
            <header
                className="sticky top-0 z-50 w-full border-b border-base"
                style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgb(var(--bg-page) / 0.85)' }}
            >
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
                    {/* Logo + nav */}
                    <div className="flex items-center gap-6">
                        <span className="font-bold text-sm tracking-tight text-primary">
                            MonApp
                        </span>
                        {isAuthenticated && (
                            <nav className="flex items-center gap-1">
                                <NavLink to="/" end className={navLinkClass}>
                                    Accueil
                                </NavLink>
                                <NavLink to="/users" className={navLinkClass}>
                                    Utilisateurs
                                </NavLink>
                            </nav>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                            className="p-2 rounded-md text-secondary hover:text-primary hover:bg-[rgb(var(--bg-border)/0.5)] transition-colors"
                        >
                            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </button>

                        {isAuthenticated && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onPress={handleLogout}
                            >
                                <LogoutIcon />
                                <span className="ml-1.5">Deconnexion</span>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer discret */}
            <footer className="border-t border-base py-4">
                <div className="max-w-6xl mx-auto px-4 text-center text-xs text-muted">
                    MonApp — Clean Architecture React Template
                </div>
            </footer>
        </div>
    );
};

export default AppLayout;
