import React, { createContext, useState } from 'react';

export const NotificationsContext = createContext({
    unread: 0,
    setUnread: () => {},
    markAllRead: () => {},
});

export function NotificationsProvider({ children }) {
    const [unread, setUnread] = useState(3); // mocked initial count

    const markAllRead = () => setUnread(0);

    return (
        <NotificationsContext.Provider value={{ unread, setUnread, markAllRead }}>
            {children}
        </NotificationsContext.Provider>
    );
}
