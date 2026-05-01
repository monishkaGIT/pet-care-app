import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    SafeAreaView, ActivityIndicator, RefreshControl, Image,
    Platform, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { postApi } from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import CommentsModal from '../../components/CommentsModal';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

// ─── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const days = Math.floor(diff / 86400);
    return days === 1 ? 'Yesterday' : `${days}d ago`;
}

// ─── PostCard Component ─────────────────────────────────────────────────────

function PostCard({ post, currentUserId, onLike, onDelete, onEdit, onOpenComments, showModal }) {
    const isOwner = post.author?._id === currentUserId;
    const isLiked = post.likes?.includes(currentUserId);

    const handleOptions = () => {
        showModal('info', 'Post Options', 'What would you like to do?', [
            { text: 'Edit Post', style: 'primary', onPress: () => onEdit(post) },
            { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]);
    };

    const confirmDelete = () => {
        showModal('warning', 'Delete Post', 'Are you sure you want to delete this post?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete(post._id) },
        ]);
    };

    return (
        <View style={styles.postCard}>
            {/* Post Header */}
            <View style={styles.postHeader}>
                <View style={styles.postHeaderLeft}>
                    <View style={styles.postAvatar}>
                        {post.author?.profileImage ? (
                            <Image source={{ uri: post.author.profileImage }} style={styles.avatarImg} />
                        ) : (
                            <Text style={styles.avatarInitial}>
                                {(post.author?.name || 'P')[0].toUpperCase()}
                            </Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.postUsername}>{post.author?.name || 'Pet Parent'}</Text>
                        <Text style={styles.postTimestamp}>{timeAgo(post.createdAt)}</Text>
                    </View>
                </View>
                {isOwner && (
                    <TouchableOpacity onPress={handleOptions} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <MaterialIcons name="more-horiz" size={22} color="#b5a99a" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Post Image */}
            {post.image ? (
                <View style={styles.postImageContainer}>
                    <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
                    {!!post.label && (
                        <View style={styles.postBadge}>
                            <MaterialIcons name="wb-sunny" size={12} color="#f59e0b" />
                            <Text style={styles.postBadgeText}>{post.label.toUpperCase()}</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.postImagePlaceholder}>
                    <MaterialIcons name="pets" size={56} color="rgba(162,210,255,0.35)" />
                </View>
            )}

            {/* Caption */}
            {!!post.caption && (
                <View style={styles.captionContainer}>
                    <Text style={styles.captionText} numberOfLines={3}>
                        <Text style={styles.captionUsername}>
                            {post.author?.name?.replace(/\s+/g, '_').toLowerCase()}{' '}
                        </Text>
                        {post.caption}
                    </Text>
                </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Action Bar — likes & comments only */}
            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post._id)} activeOpacity={0.7}>
                    <MaterialIcons
                        name={isLiked ? 'favorite' : 'favorite-outline'}
                        size={22}
                        color={isLiked ? '#ef4444' : '#b5a99a'}
                    />
                    <Text style={[styles.actionCount, isLiked && styles.actionCountLiked]}>
                        {post.likes?.length || 0}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => onOpenComments(post)} activeOpacity={0.7}>
                    <MaterialIcons name="chat-bubble-outline" size={21} color="#b5a99a" />
                    <Text style={styles.actionCount}>{post.comments?.length || 0}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function SocialScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [modalProps, showModal] = usePetCareModal();

    const fetchPosts = useCallback(async () => {
        try {
            const { data } = await postApi.get('/');
            const validPosts = (data || []).filter(post => post.author && post.author._id);
            setPosts(validPosts);
        } catch {
            showModal('error', 'Error', 'Could not load posts. Check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchPosts);
        return unsubscribe;
    }, [navigation, fetchPosts]);

    const handleLike = async (postId) => {
        try {
            const { data } = await postApi.put(`/${postId}/like`);
            setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
        } catch {
            showModal('error', 'Error', 'Could not update like');
        }
    };

    const handleDelete = async (postId) => {
        try {
            await postApi.delete(`/${postId}`);
            setPosts(prev => prev.filter(p => p._id !== postId));
        } catch {
            showModal('error', 'Error', 'Could not delete post');
        }
    };

    const handleEdit = (post) => {
        const parentNav = navigation.getParent();
        (parentNav || navigation).navigate('EditPost', { post });
    };

    const handleCommentAdded = (postId, updatedComments) => {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: updatedComments } : p));
        if (selectedPost?._id === postId) setSelectedPost(s => ({ ...s, comments: updatedComments }));
    };

    const handleCommentDeleted = (postId, updatedComments) => {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: updatedComments } : p));
        if (selectedPost?._id === postId) setSelectedPost(s => ({ ...s, comments: updatedComments }));
    };

    const handleHomePress = () => {
        showModal('warning', 'Quit Social', 'Are you sure you want to go back to main home?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Yes',
                style: 'primary',
                onPress: () => {
                    const parentNav = navigation.getParent();
                    (parentNav || navigation).navigate('MyPets');
                },
            },
        ]);
    };

    const renderHeader = () => (
        <View style={styles.headerWrapper}>
            <View style={styles.headerLeft}>
                <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8} onPress={handleHomePress}>
                    <MaterialIcons name="home" size={24} color="#30628a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Social Feed</Text>
            </View>
            <TouchableOpacity
                style={styles.headerBtn}
                activeOpacity={0.8}
                onPress={() => {
                    const parentNav = navigation.getParent();
                    (parentNav || navigation).navigate('MyPosts');
                }}
            >
                {user?.profileImage ? (
                    <Image source={{ uri: user.profileImage }} style={{ width: 24, height: 24, borderRadius: 12 }} />
                ) : (
                    <MaterialIcons name="account-circle" size={24} color="#30628a" />
                )}
            </TouchableOpacity>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
                <MaterialIcons name="pets" size={48} color="rgba(162,210,255,0.6)" />
            </View>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to share a pet moment!</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Create')}>
                <MaterialIcons name="add" size={18} color="#fff" />
                <Text style={styles.emptyBtnText}>Create Post</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {loading ? (
                <>
                    {renderHeader()}
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#a2d2ff" />
                        <Text style={styles.loadingText}>Loading feed…</Text>
                    </View>
                </>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={item => item._id}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchPosts(); }}
                            colors={['#a2d2ff']}
                            tintColor="#a2d2ff"
                        />
                    }
                    renderItem={({ item }) => (
                        <PostCard
                            post={item}
                            currentUserId={user?._id}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onOpenComments={setSelectedPost}
                            showModal={showModal}
                        />
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                />
            )}

            <CommentsModal
                visible={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                post={selectedPost}
                currentUserId={user?._id}
                onCommentAdded={handleCommentAdded}
                onCommentDeleted={handleCommentDeleted}
            />
            <PetCareModal {...modalProps} />
        </SafeAreaView>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#faf3e0' },

    // ── Header (keep exactly as before) ──
    headerWrapper: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 10,
        paddingBottom: 20,
        shadowColor: '#6f4e37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 24, fontWeight: 'bold', color: '#30628a',
        fontStyle: 'italic', marginLeft: 10,
    },

    // ── Feed ──
    scrollContent: { paddingTop: 16, paddingBottom: 120 },

    // ── Post Card ──
    postCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginHorizontal: 16,
        shadowColor: '#6f4e37',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },

    // Card header
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
    },
    postHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    postAvatar: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#e8f4fd',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 11,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#a2d2ff',
    },
    avatarImg: { width: '100%', height: '100%' },
    avatarInitial: {
        fontSize: 17, fontWeight: '800', color: '#30628a',
    },
    postUsername: { fontSize: 14, fontWeight: '700', color: '#5c3d2e' },
    postTimestamp: { fontSize: 11, color: '#b5a99a', marginTop: 1 },

    // Image
    postImageContainer: {
        width: '100%', aspectRatio: 4 / 3,
        backgroundColor: '#f5ede0',
        position: 'relative',
    },
    postImage: { width: '100%', height: '100%' },
    postImagePlaceholder: {
        width: '100%', aspectRatio: 4 / 3,
        backgroundColor: '#f5ede0',
        alignItems: 'center', justifyContent: 'center',
    },
    postBadge: {
        position: 'absolute', bottom: 12, left: 12,
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    },
    postBadgeText: {
        fontSize: 10, fontWeight: '800', color: '#79573f', letterSpacing: 0.8,
    },

    // Caption
    captionContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
    captionText: { fontSize: 14, color: '#3d2b1f', lineHeight: 21 },
    captionUsername: { fontWeight: '700', color: '#79573f' },

    // Divider
    divider: { height: 1, backgroundColor: '#f3ede3', marginHorizontal: 16, marginTop: 8 },

    // Action bar
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 4,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#faf3e0',
        marginRight: 6,
    },
    actionCount: { fontSize: 13, fontWeight: '600', color: '#b5a99a' },
    actionCountLiked: { color: '#ef4444' },

    // Loading
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { fontSize: 14, color: '#b5a99a' },

    // Empty state
    emptyState: { alignItems: 'center', paddingTop: 70, paddingHorizontal: 40 },
    emptyIconWrap: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#6f4e37', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
        marginBottom: 20,
    },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#5c3d2e' },
    emptySubtitle: { fontSize: 14, color: '#b5a99a', marginTop: 8, textAlign: 'center', lineHeight: 20 },
    emptyBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#f59e0b', paddingVertical: 13, paddingHorizontal: 28,
        borderRadius: 28, marginTop: 28,
        shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
    },
    emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
