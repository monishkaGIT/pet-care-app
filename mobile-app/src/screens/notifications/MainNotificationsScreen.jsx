import React, { useCallback, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationSections from '../../components/NotificationSections';
import { NotificationsContext } from '../../context/NotificationsContext';

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
}

const HEALTH_ICON_MAP = {
    vaccination: { icon: 'vaccines', color: '#1f5f91', bg: 'rgba(31,95,145,0.08)' },
    weight: { icon: 'monitor-weight', color: '#30628a', bg: 'rgba(162,210,255,0.25)' },
    medical: { icon: 'health-and-safety', color: '#1f5f91', bg: 'rgba(31,95,145,0.08)' },
};

const SERVICE_ICON_MAP = {
    Confirmed: { icon: 'event-available', color: '#2e7d32', bg: 'rgba(46,125,50,0.08)' },
    Completed: { icon: 'check-circle', color: '#1565c0', bg: 'rgba(21,101,192,0.08)' },
    Cancelled: { icon: 'cancel', color: '#c62828', bg: 'rgba(198,40,40,0.08)' },
    Pending: { icon: 'room-service', color: '#7a5840', bg: 'rgba(122,88,64,0.08)' },
};

function resolveServiceIcon(message) {
    if (message.includes('confirmed')) return SERVICE_ICON_MAP.Confirmed;
    if (message.includes('completed')) return SERVICE_ICON_MAP.Completed;
    if (message.includes('cancelled')) return SERVICE_ICON_MAP.Cancelled;
    return SERVICE_ICON_MAP.Pending;
}

export default function MainNotificationsScreen() {
    const { notifications, fetchNotifications, markAllRead } = useContext(NotificationsContext);
    const [refreshing, setRefreshing] = React.useState(false);

    useFocusEffect(
        useCallback(() => {
            if (markAllRead) markAllRead();
        }, [markAllRead])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    // Map real health notifications
    const healthItems = notifications
        .filter(n => n.type === 'health')
        .map(n => {
            // Try to guess record type from message
            const msgLower = n.message.toLowerCase();
            const typeKey = msgLower.includes('vaccination')
                ? 'vaccination'
                : msgLower.includes('weight')
                    ? 'weight'
                    : 'medical';
            const style = HEALTH_ICON_MAP[typeKey];
            return {
                id: n._id,
                icon: style.icon,
                iconColor: style.color,
                iconBg: style.bg,
                title: 'Health Update',
                subtitle: n.message,
                time: timeAgo(n.createdAt),
            };
        });

    // Map real service notifications
    const serviceItems = notifications
        .filter(n => n.type === 'service')
        .map(n => {
            const style = resolveServiceIcon(n.message.toLowerCase());
            return {
                id: n._id,
                icon: style.icon,
                iconColor: style.color,
                iconBg: style.bg,
                title: 'Service Update',
                subtitle: n.message,
                time: timeAgo(n.createdAt),
            };
        });

    const sections = [
        { key: 'health', title: 'Health', items: healthItems },
        { key: 'service', title: 'Service', items: serviceItems },
    ];

    const isEmpty = healthItems.length === 0 && serviceItems.length === 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="notifications-active" size={22} color="#30628a" />
                    <Text style={styles.headerTitle}>Notifications</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#a2d2ff']}
                        tintColor="#a2d2ff"
                    />
                }
            >
                <Text style={styles.pageTitle}>Health & Services</Text>
                <Text style={styles.pageSub}>Updates about pet health records and booked services.</Text>

                {isEmpty ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="notifications-none" size={64} color="rgba(162,210,255,0.5)" />
                        <Text style={styles.emptyTitle}>All caught up!</Text>
                        <Text style={styles.emptySub}>
                            Health records, vaccinations, and booking updates will appear here.
                        </Text>
                    </View>
                ) : (
                    <NotificationSections sections={sections} />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    header: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 10,
        paddingBottom: 18,
        shadowColor: 'rgba(111,78,55,0.08)',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        shadowOpacity: 1,
        elevation: 4,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#30628a', fontStyle: 'italic' },
    scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 80 },
    pageTitle: { fontSize: 30, fontWeight: '800', color: '#79573f', marginBottom: 6 },
    pageSub: { fontSize: 14, color: '#41474e', marginBottom: 22 },
    emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#79573f', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#72787f', marginTop: 8, textAlign: 'center', lineHeight: 22 },
});