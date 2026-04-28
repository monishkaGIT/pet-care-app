import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    SafeAreaView, ActivityIndicator, RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { postApi } from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';

// ─── Derive notification-like items from real post activity ─────────────────

function deriveNotifications(posts, currentUserId) {
    const items = [];

    posts.forEach((post) => {
        // Likes from other users
        if (post.likes?.length > 0) {
            const othersWhoLiked = post.likes.filter(
                (id) => id !== currentUserId
            );
            if (othersWhoLiked.length > 0 && post.author?._id === currentUserId) {
                items.push({
                    id: `like-${post._id}`,
                    icon: 'favorite',
                    iconColor: '#30628a',
                    iconBg: 'rgba(162,210,255,0.3)',
                    message: `Your post "${(post.caption || '').slice(0, 30)}${post.caption?.length > 30 ? '…' : ''}" received ${othersWhoLiked.length} like${othersWhoLiked.length > 1 ? 's' : ''}.`,
                    time: timeAgo(post.updatedAt || post.createdAt),
                });
            }
        }

        // Comments from other users on your posts
        if (post.comments?.length > 0 && post.author?._id === currentUserId) {
            const otherComments = post.comments.filter(
                (c) => c.author?._id !== currentUserId && c.author !== currentUserId
            );
            otherComments.forEach((comment) => {
                items.push({
                    id: `comment-${post._id}-${comment._id}`,
                    icon: 'comment',
                    iconColor: '#79573f',
                    iconBg: 'rgba(255,209,179,0.3)',
                    message: `${comment.author?.name || 'Someone'} commented: "${(comment.text || '').slice(0, 40)}${comment.text?.length > 40 ? '…' : ''}"`,
                    time: timeAgo(comment.createdAt || post.updatedAt || post.createdAt),
                });
            });
        }

        // Your own new posts (activity log)
        if (post.author?._id === currentUserId) {
            items.push({
                id: `post-${post._id}`,
                icon: 'photo-camera',
                iconColor: '#72787f',
                iconBg: '#e9e2d0',
                message: `You shared a new post: "${(post.caption || '').slice(0, 40)}${post.caption?.length > 40 ? '…' : ''}"`,
                time: timeAgo(post.createdAt),
            });
        }
    });

    // Sort by recency (items derived from more recent posts first)
    return items;
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
}

function AlertItem({ item, faded = false }) {
    return (
        <View style={[styles.alertCard, faded && styles.alertCardFaded]}>
            <View style={[styles.alertIconWrap, { backgroundColor: item.iconBg }]}>
                <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
            </View>
            <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{item.message}</Text>
                <Text style={styles.alertTime}>{item.time}</Text>
            </View>
        </View>
    );
}

export default function NotificationsScreen() {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const { data } = await postApi.get('/');
            const derived = deriveNotifications(data, user?._id);
            setNotifications(derived);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    // Separate today vs earlier
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayItems = notifications.slice(0, Math.min(3, notifications.length));
    const earlierItems = notifications.slice(3);

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="pets" size={22} color="#30628a" />
                    <Text style={styles.headerTitle}>Pet-stagram</Text>
                </View>
                <TouchableOpacity style={styles.headerBtn}>
                    <MaterialIcons name="add-circle" size={24} color="#30628a" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#a2d2ff" />
                    <Text style={styles.loadingText}>Loading alerts...</Text>
                </View>
            ) : (
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
                    <Text style={styles.pageTitle}>Alerts</Text>
                    <Text style={styles.pageSub}>Keep track of your furry friend's social life.</Text>

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
                            {/* Recent */}
                            {todayItems.length > 0 && (
                                <>
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>Recent</Text>
                                        <View style={styles.dividerLine} />
                                    </View>
                                    {todayItems.map((item) => (
                                        <AlertItem key={item.id} item={item} />
                                    ))}
                                </>
                            )}

                            {/* Earlier */}
                            {earlierItems.length > 0 && (
                                <>
                                    <View style={[styles.sectionHeader, { marginTop: 32 }]}>
                                        <Text style={styles.sectionTitle}>Earlier</Text>
                                        <View style={styles.dividerLine} />
                                    </View>
                                    {earlierItems.map((item) => (
                                        <AlertItem key={item.id} item={item} faded />
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </ScrollView>
            )}
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
        paddingTop: 10,
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
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#79573f' },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(233,226,208,0.5)' },
    alertCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        marginBottom: 12,
        shadowColor: 'rgba(56,56,51,0.04)', shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, shadowOpacity: 1, elevation: 1,
    },
    alertCardFaded: { backgroundColor: 'rgba(250,243,224,0.5)', opacity: 0.85 },
    alertIconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
    alertContent: { flex: 1 },
    alertMessage: { fontSize: 14, color: '#41474e', lineHeight: 20 },
    alertTime: { fontSize: 13, fontWeight: '600', color: 'rgba(48,98,138,0.7)', marginTop: 4 },

    // Loading
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { fontSize: 14, color: '#72787f' },

    // Empty state
    emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#79573f', marginTop: 20 },
    emptySub: { fontSize: 14, color: '#72787f', marginTop: 8, textAlign: 'center' },
});
