import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    return (
        <AuthProvider>
            <NotificationsProvider>
                <AppNavigator />
            </NotificationsProvider>
        </AuthProvider>
    );
}
