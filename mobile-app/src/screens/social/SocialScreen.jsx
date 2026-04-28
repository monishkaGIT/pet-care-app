import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    SafeAreaView, Alert, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { postApi } from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';

// ─── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'JUST NOW';
    if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`;
    return `${Math.floor(diff / 86400)}D AGO`;
}

function getPetChipStyle(type) {
    if (!type) return null;
    return type.toLowerCase() === 'cat'
        ? { bg: '#E8D5F0', text: '#6B21A8' }
        : { bg: '#D5E8F0', text: '#1E4D8C' };
}

// ─── PostCard Component ─────────────────────────────────────────────────────

function PostCard({ post, currentUserId, onLike, onDelete, onEdit }) {
    const isOwner = post.author?._id === currentUserId;
    const isLiked = post.likes?.includes(currentUserId);
    const petTypeOrBreed = post.pet?.type || post.pet?.breed;
    const petChip = petTypeOrBreed ? getPetChipStyle(petTypeOrBreed) : null;

    const handleOptions = () => {
        Alert.alert(
            'Post Options',
            '',
            [
                { text: 'Edit Post', onPress: () => onEdit(post) },
                { text: 'Delete Post', style: 'destructive', onPress: () => confirmDelete() },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const confirmDelete = () => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(post._id) },
            ]
        );
    };

    return (
        <View style={styles.postCard}>
            {/* Post Header */}
            <View style={styles.postHeader}>
                <View style={styles.postHeaderLeft}>
                    {/* Avatar */}
                    <View style={styles.postAvatar}>
                        {post.author?.profileImage ? (
                            <Image source={{ uri: post.author.profileImage }} style={styles.avatarImg} />
                        ) : (
                            <MaterialIcons name="person" size={20} color="#30628a" />
                        )}
                    </View>
                    <View>
                        <View style={styles.nameRow}>
                            <Text style={styles.postUsername}>{post.author?.name || 'Pet Parent'}</Text>
                            {/* Pet chip */}
                            {petChip && (
                                <View style={[styles.petChip, { backgroundColor: petChip.bg }]}>
                                    <Text style={[styles.petChipText, { color: petChip.text }]}>
                                        {petTypeOrBreed.toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {post.pet && (
                            <Text style={styles.petName}>{post.pet.name}</Text>
                        )}
                    </View>
                </View>
                {/* Options button — only for post owner */}
                {isOwner && (
                    <TouchableOpacity onPress={handleOptions} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <MaterialIcons name="more-horiz" size={24} color="#72787f" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Post Image */}
            <View style={styles.postImageContainer}>
                {post.image ? (
                    <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
                ) : (
                    <View style={styles.postImagePlaceholder}>
                        <MaterialIcons name="pets" size={72} color="rgba(162,210,255,0.4)" />
                    </View>
                )}
                {/* Label badge */}
                {!!post.label && (
                    <View style={styles.postBadge}>
                        <MaterialIcons name="wb-sunny" size={14} color="#f59e0b" />
                        <Text style={styles.postBadgeText}>{post.label.toUpperCase()}</Text>
                    </View>
                )}
            </View>

            {/* Action Bar */}
            <View style={styles.actionBar}>
                <View style={styles.actionLeft}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post._id)}>
                        <MaterialIcons
                            name={isLiked ? 'favorite' : 'favorite-outline'}
                            size={26}
                            color={isLiked ? '#ef4444' : '#79573f'}
                        />
                    </TouchableOpacity>
                    <Text style={styles.actionCount}>{post.likes?.length || 0}</Text>
                    <TouchableOpacity style={[styles.actionBtn, { marginLeft: 12 }]}>
                        <MaterialIcons name="chat-bubble-outline" size={24} color="#79573f" />
                    </TouchableOpacity>
                    <Text style={styles.actionCount}>{post.comments?.length || 0}</Text>
                </View>
                <TouchableOpacity>
                    <MaterialIcons name="bookmark-outline" size={26} color="#79573f" />
                </TouchableOpacity>
            </View>

            {/* Caption */}
            <View style={styles.captionContainer}>
                <Text style={styles.captionText} numberOfLines={3}>
                    <Text style={styles.captionUsername}>{post.author?.name?.replace(/\s+/g, '_').toLowerCase()} </Text>
                    {post.caption}
                </Text>
                {post.comments?.length > 0 && (
                    <Text style={styles.viewCommentsText}>View all {post.comments.length} comments</Text>
                )}
                <Text style={styles.timestampText}>{timeAgo(post.createdAt)}</Text>
            </View>
        </View>
    );
}

// ─── Story Row (derived from real post authors) ────────────────────────────

function StoryRow({ posts, currentUserId }) {
    // Build stories from unique post authors
    const stories = [
        { key: 'your', icon: 'person-add', label: 'YOUR STORY', ringColor: '#fcd34d', bgColor: '#ffffff', iconColor: '#30628a' },
    ];

    const seenAuthors = new Set();
    posts.forEach((post) => {
        const authorId = post.author?._id;
        if (authorId && authorId !== currentUserId && !seenAuthors.has(authorId)) {
            seenAuthors.add(authorId);
            const petName = post.pet?.name || post.author?.name || 'Pet';
            stories.push({
                key: authorId,
                icon: 'pets',
                label: petName.toUpperCase().slice(0, 10),
                ringColor: '#f59e0b',
                bgColor: '#faf3e0',
                iconColor: '#79573f',
                image: post.author?.profileImage || null,
            });
        }
    });

    return (
        <FlatList
            data={stories.slice(0, 8)}
            keyExtractor={i => i.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesScroll}
            renderItem={({ item }) => (
                <View style={styles.storyContainer}>
                    <View style={[styles.storyRing, { backgroundColor: item.ringColor }]}>
                        <View style={styles.storyIconWrapper}>
                            <View style={[styles.storyIconInner, { backgroundColor: item.bgColor }]}>
                                {item.image ? (
                                    <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%', borderRadius: 29 }} />
                                ) : (
                                    <MaterialIcons name={item.icon} size={26} color={item.iconColor} />
                                )}
                            </View>
                        </View>
                    </View>
                    <Text style={styles.storyLabel}>{item.label}</Text>
                </View>
            )}
        />
    );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function SocialScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPosts = useCallback(async () => {
        try {
            const { data } = await postApi.get('/');
            setPosts(data);
        } catch (err) {
            Alert.alert('Error', 'Could not load posts. Check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Called when CreatePost / EditPost navigates back
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchPosts);
        return unsubscribe;
    }, [navigation, fetchPosts]);

    const handleLike = async (postId) => {
        try {
            const { data } = await postApi.put(`/${postId}/like`);
            setPosts(prev => prev.map(p =>
                p._id === postId ? { ...p, likes: data.likes } : p
            ));
        } catch {
            Alert.alert('Error', 'Could not update like');
        }
    };

    const handleDelete = async (postId) => {
        try {
            await postApi.delete(`/${postId}`);
            setPosts(prev => prev.filter(p => p._id !== postId));
        } catch {
            Alert.alert('Error', 'Could not delete post');
        }
    };

    const handleEdit = (post) => {
        const parentNav = navigation.getParent();
        if (parentNav) {
            parentNav.navigate('EditPost', { post });
            return;
        }
        navigation.navigate('EditPost', { post });
    };

    const handleHomePress = () => {
        Alert.alert(
            'Quit Social',
            'Are you sure you want to go back to main home?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => {
                        const parentNav = navigation.getParent();
                        if (parentNav) {
                            parentNav.navigate('MyPets');
                        } else {
                            navigation.navigate('MyPets');
                        }
                    },
                },
            ]
        );
    };

    const renderHeader = () => (
        <>
            {/* App Bar */}
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
                    onPress={() => navigation.navigate('Create')}
                >
                    <MaterialIcons name="add-circle" size={24} color="#30628a" />
                </TouchableOpacity>
            </View>

            {/* Stories */}
            <View style={styles.storiesSection}>
                <StoryRow posts={posts} currentUserId={user?._id} />
            </View>
        </>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <MaterialIcons name="pets" size={64} color="rgba(162,210,255,0.5)" />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to share a pet moment!</Text>
            <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('Create')}
            >
                <MaterialIcons name="add" size={18} color="#ffffff" />
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
                        <Text style={styles.loadingText}>Loading feed...</Text>
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
                        />
                    )}
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />
            )}
        </SafeAreaView>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },

    // Header
    headerWrapper: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 10,
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

    // Stories
    storiesSection: { marginTop: 20, marginBottom: 12 },
    storiesScroll: { paddingHorizontal: 20 },
    storyContainer: { alignItems: 'center', marginRight: 20 },
    storyRing: {
        padding: 4, borderRadius: 40,
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    storyIconWrapper: {
        backgroundColor: '#fff9ec', borderRadius: 36, padding: 3,
    },
    storyIconInner: {
        width: 58, height: 58, borderRadius: 29,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#fff9ec',
    },
    storyLabel: { fontSize: 9, fontWeight: 'bold', color: '#41474e', letterSpacing: 0.5 },

    // Feed
    scrollContent: { paddingBottom: 120 },

    // Post Card
    postCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 16,
        shadowColor: 'rgba(56,56,51,0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    postHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', padding: 16,
    },
    postHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    postAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(162,210,255,0.3)',
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
        overflow: 'hidden',
    },
    avatarImg: { width: '100%', height: '100%' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    postUsername: { fontSize: 14, fontWeight: 'bold', color: '#79573f' },
    petChip: {
        paddingHorizontal: 7, paddingVertical: 2,
        borderRadius: 4, borderWidth: 1.5, borderColor: '#00000022',
    },
    petChipText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
    petName: { fontSize: 11, color: '#72787f', marginTop: 1 },

    // Post Image
    postImageContainer: {
        width: '100%', aspectRatio: 4 / 3,
        backgroundColor: '#faf3e0', position: 'relative',
    },
    postImage: { width: '100%', height: '100%' },
    postImagePlaceholder: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
    },
    postBadge: {
        position: 'absolute', bottom: 16, left: 16,
        backgroundColor: 'rgba(255,255,255,0.85)',
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: 20, flexDirection: 'row', alignItems: 'center',
        shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4, shadowOpacity: 1,
    },
    postBadgeText: {
        fontSize: 10, fontWeight: 'bold', color: '#79573f',
        letterSpacing: 1, marginLeft: 5,
    },

    // Action bar
    actionBar: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    },
    actionLeft: { flexDirection: 'row', alignItems: 'center' },
    actionBtn: { marginRight: 4 },
    actionCount: { fontSize: 13, fontWeight: '600', color: '#79573f', marginRight: 4 },

    // Caption
    captionContainer: { paddingHorizontal: 16, paddingBottom: 20 },
    captionText: { fontSize: 14, color: '#1e1c10', lineHeight: 20 },
    captionUsername: { fontWeight: 'bold', color: '#79573f' },
    viewCommentsText: { fontSize: 12, color: '#41474e', fontWeight: '500', marginTop: 8 },
    timestampText: { fontSize: 10, color: '#72787f', letterSpacing: 0.5, marginTop: 4 },

    // Loading
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { fontSize: 14, color: '#72787f' },

    // Empty state
    emptyState: {
        alignItems: 'center', paddingTop: 60, paddingHorizontal: 40,
    },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#79573f', marginTop: 20 },
    emptySubtitle: { fontSize: 14, color: '#72787f', marginTop: 8, textAlign: 'center' },
    emptyBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#f59e0b', paddingVertical: 12, paddingHorizontal: 24,
        borderRadius: 24, marginTop: 24,
        shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    emptyBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});
