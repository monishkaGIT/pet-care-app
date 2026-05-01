import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NotificationsContext } from '../context/NotificationsContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function NotificationBell({ initialCount = 0 }) {
    const navigation = useNavigation();
    const { unread, setUnread, markAllRead } = useContext(NotificationsContext);

    // fallback to prop when context not provided
    const display = typeof unread === 'number' ? unread : initialCount;

    const openNotifications = () => {
        navigation.navigate('Notifications');
        // mark as read via context when opening
        if (markAllRead) markAllRead();
        else setUnread && setUnread(0);
    };

    return (
        <TouchableOpacity style={styles.iconBtn} onPress={openNotifications} activeOpacity={0.85}>
            <MaterialIcons name="notifications-none" size={24} color="#30628a" />
            {display > 0 && (
                <View style={styles.badge} pointerEvents="none">
                    <Text style={styles.badgeText}>{display > 99 ? '99+' : display}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 6,
        right: 6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#D84315',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
