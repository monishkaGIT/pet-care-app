import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Alert, ActivityIndicator, RefreshControl, Image,
    Platform, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { postApi } from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function MyPostsScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyPosts = useCallback(async () => {
        try {
            const { data } = await postApi.get('/');
            // Filter only the current user's posts
            const myPosts = data.filter(p => p.author?._id === user?._id);
            setPosts(myPosts);
        } catch (err) {
            Alert.alert('Error', 'Could not load your posts.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMyPosts();
    }, [fetchMyPosts]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchMyPosts);
        return unsubscribe;
    }, [navigation, fetchMyPosts]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyPosts();
    };

    const handleEdit = (post) => {
        navigation.navigate('EditPost', { post });
    };

    const handleDelete = (post) => {
        Alert.alert(
            'Delete Post',
            `Are you sure you want to delete this post?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await postApi.delete(`/${post._id}`);
                            setPosts(prev => prev.filter(p => p._id !== post._id));
                        } catch {
                            Alert.alert('Error', 'Could not delete post');
                        }
                    },
                },
            ],
        );
    };

    const renderPostCard = ({ item }) => (
        <View style={styles.card}>
            {/* Image */}
            <View style={styles.cardImageWrap}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                    <View style={styles.cardImagePlaceholder}>
                        <MaterialIcons name="pets" size={40} color="rgba(162,210,255,0.5)" />
                    </View>
                )}
                {/* Label badge */}
                {!!item.label && (
                    <View style={styles.labelBadge}>
                        <Text style={styles.labelBadgeText}>{item.label.toUpperCase()}</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                {/* Caption */}
                <Text style={styles.cardCaption} numberOfLines={2}>{item.caption || 'No caption'}</Text>

                {/* Meta row */}
                <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                        <MaterialIcons name="favorite" size={14} color="#ef4444" />
                        <Text style={styles.metaText}>{item.likes?.length || 0}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <MaterialIcons name="chat-bubble-outline" size={14} color={COLORS.outline} />
                        <Text style={styles.metaText}>{item.comments?.length || 0}</Text>
                    </View>
                    <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
                </View>

                {/* Action buttons */}
                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)} activeOpacity={0.7}>
                        <MaterialIcons name="edit" size={16} color={COLORS.primary} />
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)} activeOpacity={0.7}>
                        <MaterialIcons name="delete-outline" size={16} color={COLORS.error} />
                        <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <MaterialIcons name="photo-library" size={56} color={COLORS.outlineVariant} />
            <Text style={styles.emptyTitle}>No Posts Yet</Text>
            <Text style={styles.emptySubtitle}>
                Your posts will appear here.{'\n'}Go to Social Feed and create your first post!
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: COLORS.onSurfaceVariant }}>Loading your posts...</Text>
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
                        <Text style={styles.topBarTitle}>My Posts</Text>
                    </View>
                </View>
                <View style={styles.topBarRight}>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{posts.length}</Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                renderItem={renderPostCard}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={posts.length === 0 ? styles.emptyListContainer : styles.listContent}
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
    topBarRight: {
        position: 'absolute',
        right: 20,
        bottom: 20,
    },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    countText: { fontSize: 14, fontWeight: '800', color: '#fff' },

    /* List */
    listContent: { padding: 16, paddingBottom: 32 },
    emptyListContainer: { flexGrow: 1 },

    /* Card */
    card: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 16,
        marginBottom: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.outlineVariant + '50',
        ...SHADOWS.card,
    },
    cardImageWrap: {
        width: '100%',
        height: 160,
        backgroundColor: '#faf3e0',
        position: 'relative',
    },
    cardImage: { width: '100%', height: '100%' },
    cardImagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    labelBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    labelBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.secondary, letterSpacing: 0.5 },
    cardContent: { padding: 14 },
    cardCaption: { fontSize: 15, fontWeight: '600', color: COLORS.onSurface, lineHeight: 21, marginBottom: 10 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, fontWeight: '600', color: COLORS.onSurfaceVariant },
    timeText: { fontSize: 11, color: COLORS.outline, marginLeft: 'auto' },

    /* Actions */
    cardActions: {
        flexDirection: 'row',
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.outlineVariant + '40',
        paddingTop: 10,
    },
    editBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: COLORS.primaryContainer + '40',
        gap: 6,
    },
    editBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
    deleteBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: COLORS.errorContainer + '40',
        gap: 6,
    },
    deleteBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.error },

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
