import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Core components
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import NotFoundPage from './components/NotFoundPage';
import AppLayout from './components/AppLayout';

// Feature pages
import HomePage from '../features/users/presentation/pages/HomePage';
import UsersPage from '../features/users/presentation/pages/UsersPage';
import LoginPage from '../features/auth/presentation/pages/LoginPage';

const AppRoutes: React.FC = () => {
    return (
        <ErrorBoundary>
            <Router>
                <AppLayout>
                    <Routes>
                        {/* Routes publiques */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Routes protegees */}
                        <Route path="/" element={
                            <PrivateRoute><HomePage /></PrivateRoute>
                        } />
                        <Route path="/users" element={
                            <PrivateRoute><UsersPage /></PrivateRoute>
                        } />

                        {/* 404 catch-all */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </AppLayout>
            </Router>
        </ErrorBoundary>
    );
};

export default AppRoutes;
