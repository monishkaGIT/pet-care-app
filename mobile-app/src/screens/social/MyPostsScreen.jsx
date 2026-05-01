import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Alert, ActivityIndicator, RefreshControl, Image,
    Platform, StatusBar, SafeAreaView, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import api, { postApi } from '../../api/axiosConfig';
import { fetchUserPets } from '../../api/petApi';
import { AuthContext } from '../../context/AuthContext';

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function getPetTone(type) {
    if (!type) {
        return { bg: 'rgba(162,210,255,0.25)', icon: '#30628a' };
    }

    return type.toLowerCase() === 'cat'
        ? { bg: 'rgba(255,209,179,0.35)', icon: '#8e4e14' }
        : { bg: 'rgba(162,210,255,0.35)', icon: '#30628a' };
}

function PetCard({ pet, index }) {
    const tone = getPetTone(pet.type || pet.breed);

    return (
        <View style={styles.petCard}>
            {pet.profileImage ? (
                <Image source={{ uri: pet.profileImage }} style={styles.petAvatar} />
            ) : (
                <View style={[styles.petAvatarPlaceholder, { backgroundColor: tone.bg }]}>
                    <MaterialIcons name="pets" size={24} color={tone.icon} />
                </View>
            )}
            <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
            <Text style={styles.petBreed} numberOfLines={1}>{pet.breed || pet.type || 'Pet companion'}</Text>
        </View>
    );
}

function StatCard({ label, value }) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function SocialProfileHeader({
    user,
    postsCount,
    petsCount,
    onEditProfile,
    pets,
}) {
    return (
        <View style={styles.profileHeaderWrap}>
            <View style={styles.profileHero}>
                <TouchableOpacity style={styles.avatarWrap} onPress={onEditProfile} activeOpacity={0.85}>
                    <View style={styles.avatarRing}>
                        {user?.profileImage ? (
                            <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <MaterialIcons name="person" size={52} color="#a2d2ff" />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                <View style={styles.profileInfo}>
                    <View style={styles.profileNameRow}>
                        <Text style={styles.profileUsername} numberOfLines={1} adjustsFontSizeToFit>
                            {user?.name || 'Pet Parent'}
                        </Text>
                        <TouchableOpacity style={styles.editProfileBtn} onPress={onEditProfile} activeOpacity={0.85}>
                            <MaterialIcons name="edit" size={14} color="#ffffff" />
                            <Text style={styles.editProfileBtnText}>Edit Bio</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.profileBio}>
                        {user?.bio?.trim() || 'Add a bio to share your pet story and update it from your profile.'}
                    </Text>

                    <View style={styles.statsRow}>
                        <StatCard label="Posts" value={postsCount} />
                        <StatCard label="Pets" value={petsCount} />
                    </View>
                </View>
            </View>

            <View style={styles.petsSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Connected Pets</Text>
                    <Text style={styles.sectionMeta}>{petsCount} linked</Text>
                </View>

                {pets.length === 0 ? (
                    <View style={styles.noPetsCard}>
                        <MaterialIcons name="pets" size={24} color="#30628a" />
                        <Text style={styles.noPetsText}>No pets linked yet. Add a pet in MyPets to connect them here.</Text>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsScroll}>
                        {pets.map((pet, index) => (
                            <PetCard key={pet._id} pet={pet} index={index} />
                        ))}
                    </ScrollView>
                )}
            </View>

            <View style={styles.postsSectionHeader}>
                <View>
                    <Text style={styles.sectionTitle}>My Posts</Text>
                    <Text style={styles.postsSectionMeta}>Edit or delete your own posts below.</Text>
                </View>
            </View>
        </View>
    );
}

export default function MyPostsScreen({ navigation }) {
    const { user, setUser } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [pets, setPets] = useState([]);
    const [profileUser, setProfileUser] = useState(user);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyPosts = useCallback(async () => {
        try {
            const [postsResult, petsResult] = await Promise.allSettled([
                postApi.get('/'),
                fetchUserPets(),
            ]);

            try {
                const { data: latestProfile } = await api.get('/profile');
                setProfileUser(latestProfile);
                setUser(latestProfile);
            } catch {
                setProfileUser(user);
            }

            if (postsResult.status === 'fulfilled') {
                const myPosts = postsResult.value.data.filter(p => p.author?._id === user?._id);
                setPosts(myPosts);
            } else {
                Alert.alert('Error', 'Could not load your posts.');
            }

            if (petsResult.status === 'fulfilled') {
                setPets(petsResult.value);
            } else {
                setPets([]);
            }
        } catch (err) {
            Alert.alert('Error', 'Could not load your profile page.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [setUser, user]);

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

    const goToProfile = () => {
        navigation.navigate('EditBio');
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
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)} activeOpacity={0.85}>
                        <MaterialIcons name="edit" size={18} color="#ffffff" />
                        <Text style={styles.editBtnText}>Edit Post</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)} activeOpacity={0.85}>
                        <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderHeader = () => (
        <SocialProfileHeader
            user={profileUser || user}
            postsCount={posts.length}
            petsCount={pets.length}
            pets={pets}
            onEditProfile={goToProfile}
        />
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
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: COLORS.onSurfaceVariant }}>Loading your profile...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.topBar, SHADOWS.header]}>
                <View style={styles.topBarLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.topBarBrand}>PetCare</Text>
                        <Text style={styles.topBarTitle}>My Profile</Text>
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
                ListHeaderComponent={renderHeader}
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
        </SafeAreaView>
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

    /* Social profile header */
    profileHeaderWrap: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 8,
    },
    profileHero: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        gap: 16,
        ...SHADOWS.card,
    },
    avatarWrap: { position: 'relative' },
    avatarRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#a2d2ff',
        padding: 3,
        overflow: 'hidden',
        backgroundColor: '#faf3e0',
    },
    avatarImg: { width: '100%', height: '100%', borderRadius: 50 },
    avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    editBadge: {
        display: 'none',
    },
    profileInfo: { flex: 1, paddingTop: 4 },
    profileNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    profileUsername: { flex: 1, fontSize: 22, fontWeight: '900', color: '#79573f' },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#30628a',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
    },
    editProfileBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
    profileBio: { fontSize: 13, color: '#41474e', lineHeight: 18, marginTop: 8 },
    statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
    statCard: {
        flex: 1,
        backgroundColor: '#fff9ec',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#efe8d5',
    },
    statValue: { fontSize: 18, fontWeight: '900', color: '#30628a' },
    statLabel: { fontSize: 10, fontWeight: '800', color: '#79573f', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },

    petsSection: {
        marginTop: 14,
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 24,
        padding: 16,
        marginHorizontal: 16,
        ...SHADOWS.card,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    sectionTitle: { fontSize: 14, fontWeight: '900', color: '#79573f', textTransform: 'uppercase', letterSpacing: 1 },
    sectionMeta: { fontSize: 11, color: COLORS.textSecondary },
    noPetsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#faf3e0',
        padding: 14,
        borderRadius: 16,
    },
    noPetsText: { flex: 1, fontSize: 13, color: COLORS.onSurfaceVariant, lineHeight: 18 },
    petsScroll: { paddingRight: 8 },
    petCard: {
        width: 118,
        marginRight: 12,
        backgroundColor: '#fff9ec',
        borderRadius: 18,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.outlineVariant + '40',
    },
    petAvatar: { width: 62, height: 62, borderRadius: 31, marginBottom: 10 },
    petAvatarPlaceholder: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    petName: { fontSize: 13, fontWeight: '900', color: '#79573f' },
    petBreed: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
    postsSectionHeader: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 6 },
    postsSectionMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },

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
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.outlineVariant + '40',
        paddingTop: 14,
        marginTop: 4,
    },
    editBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#30628a',
        gap: 8,
    },
    editBtnText: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
    deleteBtn: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: '#fee2e2',
    },

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
