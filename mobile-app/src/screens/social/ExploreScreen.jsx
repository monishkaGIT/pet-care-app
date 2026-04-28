import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, SafeAreaView, Image, ActivityIndicator, RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { postApi } from '../../api/axiosConfig';

// ─── Derive trending tags from real post data ──────────────────────────────

function deriveTrendingTags(posts) {
    const tagCounts = {};

    posts.forEach((post) => {
        if (post.label) {
            const label = post.label.trim();
            if (label) {
                const tag = label.startsWith('#') ? label : `#${label}`;
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
        }
    });

    // Also count by pet type
    posts.forEach((post) => {
        if (post.pet?.type) {
            const tag = `#${post.pet.type}Life`;
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
    });

    const TAG_STYLES = [
        { icon: 'pets', bg: '#ffffff', iconBg: '#a2d2ff', iconColor: '#275b82' },
        { icon: 'hotel', bg: 'rgba(162,210,255,0.3)', iconBg: '#ffffff', iconColor: '#79573f' },
        { icon: 'restaurant', bg: '#ffffff', iconBg: 'rgba(255,192,146,0.4)', iconColor: '#8e4e14' },
        { icon: 'park', bg: '#faf3e0', iconBg: '#ffffff', iconColor: '#30628a' },
    ];

    return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([tag, count], index) => ({
            id: index + 1,
            tag,
            posts: `${count} post${count > 1 ? 's' : ''}`,
            ...TAG_STYLES[index % TAG_STYLES.length],
        }));
}

export default function ExploreScreen() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPosts = useCallback(async () => {
        try {
            const { data } = await postApi.get('/');
            setPosts(data);
        } catch (err) {
            console.error('Failed to load explore posts:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const trendingTags = deriveTrendingTags(posts);

    // Filter posts by search query (caption or label)
    const filteredPosts = searchQuery.trim()
        ? posts.filter(
            (p) =>
                (p.caption || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.label || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.pet?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
        : posts;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.headerBtn}>
                        <MaterialIcons name="home" size={24} color="#30628a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Explore</Text>
                </View>
                <TouchableOpacity style={styles.headerBtn}>
                    <MaterialIcons name="add-circle" size={24} color="#30628a" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#a2d2ff" />
                    <Text style={styles.loadingText}>Discovering posts...</Text>
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
                    {/* Search */}
                    <View style={styles.searchWrapper}>
                        <MaterialIcons name="search" size={22} color="#79573f" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Find your favorite paws..."
                            placeholderTextColor="#72787f"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialIcons name="close" size={20} color="#72787f" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Trending Tags — only show if there are labels */}
                    {trendingTags.length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionPreTitle}>WHAT'S BARKING</Text>
                                <Text style={styles.sectionTitle}>Trending Tags</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
                                {trendingTags.map((tag) => (
                                    <TouchableOpacity
                                        key={tag.id}
                                        style={[styles.tagCard, { backgroundColor: tag.bg }]}
                                        activeOpacity={0.8}
                                        onPress={() => setSearchQuery(tag.tag.replace('#', ''))}
                                    >
                                        <View style={[styles.tagIconWrap, { backgroundColor: tag.iconBg }]}>
                                            <MaterialIcons name={tag.icon} size={22} color={tag.iconColor} />
                                        </View>
                                        <Text style={styles.tagName}>{tag.tag}</Text>
                                        <Text style={styles.tagCount}>{tag.posts}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerLabel}>
                            {searchQuery ? 'SEARCH RESULTS' : 'RECENT POSTS'}
                        </Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Post Grid — built from real posts */}
                    {filteredPosts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="search-off" size={48} color="rgba(121,87,63,0.2)" />
                            <Text style={styles.emptyTitle}>
                                {searchQuery ? 'No matching posts' : 'No posts yet'}
                            </Text>
                            <Text style={styles.emptySub}>
                                {searchQuery
                                    ? 'Try a different search term.'
                                    : 'Be the first to share a pet moment!'}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.postGrid}>
                            {filteredPosts.map((post, index) => (
                                <TouchableOpacity
                                    key={post._id || index}
                                    style={[styles.postCell, !post.image && { backgroundColor: POST_GRID_FALLBACK_COLORS[index % POST_GRID_FALLBACK_COLORS.length] }]}
                                    activeOpacity={0.8}
                                >
                                    {post.image ? (
                                        <Image
                                            source={{ uri: post.image }}
                                            style={styles.postCellImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <MaterialIcons name="pets" size={36} color="rgba(121,87,63,0.15)" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// Fallback colors for posts without images
const POST_GRID_FALLBACK_COLORS = [
    'rgba(162,210,255,0.4)', '#e9e2d0', 'rgba(162,210,255,0.2)',
    '#faf3e0', 'rgba(162,210,255,0.3)', '#e9e2d0',
];

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#faf3e0' },
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
    headerBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#30628a' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
    searchWrapper: {
        backgroundColor: '#faf3e0', borderWidth: 2, borderColor: '#e9e2d0',
        borderRadius: 30, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 18, marginBottom: 28,
        shadowColor: 'rgba(111,78,55,0.04)', shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, shadowOpacity: 1, elevation: 1,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 52, fontSize: 15, color: '#1e1c10' },
    sectionHeader: { marginBottom: 16, paddingHorizontal: 4 },
    sectionPreTitle: { fontSize: 10, fontWeight: 'bold', color: '#30628a', letterSpacing: 2, marginBottom: 4 },
    sectionTitle: { fontSize: 26, fontWeight: '800', color: '#79573f' },
    tagsScroll: { paddingBottom: 16, gap: 12 },
    tagCard: {
        width: 150, backgroundColor: '#ffffff',
        borderRadius: 16, padding: 18,
        marginRight: 4,
        shadowColor: 'rgba(111,78,55,0.04)', shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, shadowOpacity: 1, elevation: 2,
        justifyContent: 'space-between', minHeight: 180,
    },
    tagIconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 'auto' },
    tagName: { fontSize: 16, fontWeight: 'bold', color: '#79573f', marginTop: 16, marginBottom: 4 },
    tagCount: { fontSize: 12, color: '#72787f', fontWeight: '500' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 28 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#e9e2d0' },
    dividerLabel: { fontSize: 10, fontWeight: 'bold', color: 'rgba(121,87,63,0.4)', letterSpacing: 2 },
    postGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    postCell: {
        width: '31.2%',
        aspectRatio: 1,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    postCellImage: {
        width: '100%',
        height: '100%',
    },

    // Loading
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { fontSize: 14, color: '#72787f' },

    // Empty state
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#79573f', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#72787f', marginTop: 8, textAlign: 'center' },
});
