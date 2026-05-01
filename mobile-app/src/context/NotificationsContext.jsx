import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { notificationApi } from '../api/axiosConfig';
import { AuthContext } from './AuthContext';

export const NotificationsContext = createContext({
    unread: 0,
    notifications: [],
    fetchNotifications: async () => {},
    markAllRead: async () => {},
});

export function NotificationsProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await notificationApi.get('/');
            setNotifications(data);
            setUnread(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to load notifications', error);
        }
    }, [user]);

    const markAllRead = async () => {
        if (!user) return;
        try {
            await notificationApi.put('/mark-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnread(0);
        } catch (error) {
            console.error('Failed to mark notifications as read', error);
        }
    };

    // Load once on mount/user change and start polling
    useEffect(() => {
        let interval;
        if (user) {
            fetchNotifications();
            interval = setInterval(() => {
                fetchNotifications();
            }, 30000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [user, fetchNotifications]);

    return (
        <NotificationsContext.Provider value={{ unread, notifications, fetchNotifications, markAllRead }}>
            {children}
        </NotificationsContext.Provider>
    );
}
