import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Platform, StatusBar, RefreshControl, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchPublicFeedbacks } from '../../api/feedbackApi';

const CATEGORY_ICONS = {
    'General': 'chat-bubble-outline',
    'Bug Report': 'bug-report',
    'Feature Request': 'lightbulb-outline',
    'Compliment': 'thumb-up',
    'Other': 'more-horiz',
};

const CATEGORY_COLORS = {
    'General': '#30628a',
    'Bug Report': '#ba1a1a',
    'Feature Request': '#8e4e14',
    'Compliment': '#10b981',
    'Other': '#72787f',
};

export default function PublicFeedbackScreen({ navigation }) {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];

    const loadFeedbacks = useCallback(async () => {
        try {
            const data = await fetchPublicFeedbacks();
            setFeedbacks(data);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            console.error('Failed to load public feedbacks:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadFeedbacks();
    }, [loadFeedbacks]);

    const onRefresh = () => {
        setRefreshing(true);
        fadeAnim.setValue(0);
        loadFeedbacks();
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    };

    const renderStars = (count) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <MaterialIcons
                    key={i}
                    name={i <= count ? 'star' : 'star-border'}
                    size={16}
                    color={i <= count ? '#f59e0b' : COLORS.outlineVariant}
                    style={{ marginRight: 1 }}
                />
            );
        }
        return <View style={{ flexDirection: 'row', alignItems: 'center' }}>{stars}</View>;
    };

    // Compute average rating
    const avgRating = feedbacks.length > 0
        ? (feedbacks.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedbacks.length).toFixed(1)
        : '0.0';

    const renderCard = ({ item }) => (
        <Animated.View
            style={[
                styles.card,
                {
                    opacity: fadeAnim,
                    transform: [{
                        translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                        }),
                    }],
                },
            ]}
        >
            {/* Top row: user + date */}
            <View style={styles.cardTopRow}>
                <View style={styles.cardUserRow}>
                    <View style={styles.cardAvatar}>
                        <Text style={styles.cardAvatarText}>
                            {item.userName ? item.userName[0].toUpperCase() : '?'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.cardUserName}>{item.userName || 'User'}</Text>
                        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: (CATEGORY_COLORS[item.category] || '#72787f') + '18' }]}>
                    <MaterialIcons
                        name={CATEGORY_ICONS[item.category] || 'more-horiz'}
                        size={12}
                        color={CATEGORY_COLORS[item.category] || '#72787f'}
                    />
                    <Text style={[styles.categoryText, { color: CATEGORY_COLORS[item.category] || '#72787f' }]}>
                        {item.category}
                    </Text>
                </View>
            </View>

            {/* Rating */}
            <View style={{ marginTop: 10, marginBottom: 6 }}>
                {renderStars(item.rating)}
            </View>

            {/* Title + Message */}
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMessage} numberOfLines={4}>{item.message}</Text>
        </Animated.View>
    );

    const renderHeader = () => (
        <View style={styles.statsSection}>
            <View style={styles.statsRow}>
                <View style={[styles.statCard, SHADOWS.card]}>
                    <MaterialIcons name="rate-review" size={22} color={COLORS.primary} />
                    <Text style={styles.statValue}>{feedbacks.length}</Text>
                    <Text style={styles.statLabel}>Reviews</Text>
                </View>
                <View style={[styles.statCard, SHADOWS.card]}>
                    <MaterialIcons name="star" size={22} color="#f59e0b" />
                    <Text style={styles.statValue}>{avgRating}</Text>
                    <Text style={styles.statLabel}>Avg Rating</Text>
                </View>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <MaterialIcons name="rate-review" size={56} color={COLORS.outlineVariant} />
            <Text style={styles.emptyTitle}>No Reviews Yet</Text>
            <Text style={styles.emptySubtitle}>
                Be the first to share your experience!{'\n'}Sign up to leave your feedback.
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: COLORS.onSurfaceVariant }}>Loading reviews...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.topBar, SHADOWS.header]}>
                <View style={styles.topBarLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.topBarBrand}>PetCare</Text>
                        <Text style={styles.topBarTitle}>User Reviews</Text>
                    </View>
                </View>
                <View style={styles.topBarIcon}>
                    <MaterialIcons name="reviews" size={22} color="#fff" />
                </View>
            </View>

            <FlatList
                data={feedbacks}
                keyExtractor={(item) => item._id}
                renderItem={renderCard}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={feedbacks.length === 0 ? styles.emptyListContainer : styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    /* Top bar */
    topBar: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 56,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: { padding: 4 },
    topBarBrand: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' },
    topBarTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
    topBarIcon: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Stats */
    statsSection: { paddingHorizontal: 16, marginTop: 20, marginBottom: 8 },
    statsRow: { flexDirection: 'row', gap: 12 },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        gap: 4,
    },
    statValue: { fontSize: 22, fontWeight: '800', color: COLORS.secondary, marginTop: 2 },
    statLabel: { fontSize: 10, fontWeight: '800', color: COLORS.outline, textTransform: 'uppercase', letterSpacing: 0.5 },

    /* List */
    listContent: { padding: 16, paddingBottom: 32 },
    emptyListContainer: { flexGrow: 1 },

    /* Card */
    card: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.outlineVariant + '60',
        ...SHADOWS.card,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    cardAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardAvatarText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
    cardUserName: { fontSize: 14, fontWeight: '700', color: COLORS.secondary },
    cardDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 4,
    },
    categoryText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.onSurface, marginBottom: 4 },
    cardMessage: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },

    /* Empty */
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.onSurface, marginTop: 16, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21 },
});
