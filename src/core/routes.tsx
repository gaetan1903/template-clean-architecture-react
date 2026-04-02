import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

// Core components
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import NotFoundPage from './components/NotFoundPage';

// Feature pages
import HomePage from '../features/users/presentation/pages/HomePage';
import UsersPage from '../features/users/presentation/pages/UsersPage';
import LoginPage from '../features/auth/presentation/pages/LoginPage';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const AppRoutes: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
                <Router>
                    <Routes>
                        {/* Routes publiques */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Routes protégées */}
                        <Route path="/" element={
                            <PrivateRoute><HomePage /></PrivateRoute>
                        } />
                        <Route path="/users" element={
                            <PrivateRoute><UsersPage /></PrivateRoute>
                        } />

                        {/* 404 catch-all */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Router>
            </ErrorBoundary>
        </ThemeProvider>
    );
};

export default AppRoutes;
