import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    SafeAreaView, ActivityIndicator, RefreshControl,
    Platform, StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { postApi } from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import { NotificationsContext } from '../../context/NotificationsContext';
import NotificationSections from '../../components/NotificationSections';

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
}

export default function ActivityScreen() {
    const { notifications, fetchNotifications } = useContext(NotificationsContext);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    // Filter to show only 'like' and 'comment' notifications
    const socialActivity = notifications
        .filter(n => n.type === 'like' || n.type === 'comment')
        .map(n => ({
            id: n._id,
            icon: n.type === 'like' ? 'favorite' : 'comment',
            iconColor: n.type === 'like' ? '#30628a' : '#79573f',
            iconBg: n.type === 'like' ? 'rgba(162,210,255,0.3)' : 'rgba(255,209,179,0.3)',
            message: n.message,
            time: timeAgo(n.createdAt),
        }));

    const todayItems = socialActivity.slice(0, Math.min(3, socialActivity.length));
    const earlierItems = socialActivity.slice(3);
    const sections = [
        { key: 'recent', title: 'Recent', items: todayItems },
        { key: 'earlier', title: 'Earlier', items: earlierItems, faded: true },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="pets" size={22} color="#30628a" />
                    <Text style={styles.headerTitle}>Activity</Text>
                </View>
            </View>

            {/* We no longer show a loading state for Context data, unless it's null */}
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
                    <Text style={styles.pageTitle}>Social Activity</Text>
                    <Text style={styles.pageSub}>Likes and comments from the feed appear here.</Text>

                    {notifications.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="notifications-none" size={64} color="rgba(162,210,255,0.5)" />
                            <Text style={styles.emptyTitle}>No notifications yet</Text>
                            <Text style={styles.emptySub}>
                                Start posting and interacting to see activity here!
                            </Text>
                        </View>
                    ) : (
                        <>
                            <NotificationSections sections={sections} />
                        </>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: 'rgba(111,78,55,0.08)', shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 1, elevation: 4,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#30628a', fontStyle: 'italic' },
    headerBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 100 },
    pageTitle: { fontSize: 34, fontWeight: '800', color: '#79573f', letterSpacing: -0.5, marginBottom: 6 },
    pageSub: { fontSize: 14, color: '#41474e', fontWeight: '500', marginBottom: 28 },

    // Loading
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { fontSize: 14, color: '#72787f' },

    // Empty state
    emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#79573f', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#72787f', marginTop: 8, textAlign: 'center' },
});
