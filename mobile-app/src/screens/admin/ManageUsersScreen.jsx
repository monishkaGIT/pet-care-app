import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    Platform,
    StatusBar,
    TextInput,
    Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import api from '../../api/axiosConfig';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

const { width } = Dimensions.get('window');

// ── Components ─────────────────────────────────────────────────────

function FilterChip({ label, active, onPress, count }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.chip, active && styles.chipActive]}
        >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {label}{count !== undefined ? ` (${count})` : ''}
            </Text>
        </TouchableOpacity>
    );
}

function UserCard({ user, onPress }) {
    const initials = user.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const isAdmin = user.role === 'admin';
    const joinDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Unknown';

    return (
        <TouchableOpacity
            style={[styles.card, SHADOWS.editorial]}
            activeOpacity={0.9}
            onPress={() => onPress(user)}
        >
            <View style={styles.cardBody}>
                {/* Avatar */}
                <View style={[styles.avatar, isAdmin && styles.avatarAdmin, user.profileImage && { backgroundColor: 'transparent' }]}>
                    {user.profileImage ? (
                        <Image source={{ uri: user.profileImage }} style={{ width: '100%', height: '100%', borderRadius: 24 }} />
                    ) : (
                        <Text style={[styles.avatarText, isAdmin && styles.avatarTextAdmin]}>{initials}</Text>
                    )}
                </View>

                {/* Info */}
                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                        {isAdmin && (
                            <View style={styles.adminBadge}>
                                <MaterialIcons name="shield" size={10} color="#fff" />
                                <Text style={styles.adminBadgeText}>Admin</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                    <View style={styles.metaRow}>
                        <MaterialIcons name="calendar-today" size={12} color={COLORS.outline} />
                        <Text style={styles.metaText}>Joined {joinDate}</Text>
                    </View>
                </View>

                {/* Chevron */}
                <MaterialIcons name="chevron-right" size={24} color={COLORS.outline} />
            </View>
        </TouchableOpacity>
    );
}

// ── Screen ─────────────────────────────────────────────────────────

export default function ManageUsersScreen({ navigation }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [modalProps, showModal] = usePetCareModal();

    const loadUsers = useCallback(async () => {
        try {
            const { data } = await api.get('/');
            setUsers(data);
        } catch (err) {
            showModal('error', 'Error', err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadUsers();
        });
        return unsubscribe;
    }, [navigation, loadUsers]);

    const onRefresh = () => {
        setRefreshing(true);
        loadUsers();
    };

    // Counts
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const regularCount = users.filter(u => u.role === 'user').length;

    // Filter + search
    let filteredUsers = users;
    if (activeFilter === 'Admins') {
        filteredUsers = filteredUsers.filter(u => u.role === 'admin');
    } else if (activeFilter === 'Users') {
        filteredUsers = filteredUsers.filter(u => u.role === 'user');
    }
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter(
            u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
        );
    }

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: COLORS.onSurfaceVariant }}>Loading users...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PetCareModal {...modalProps} />
            {/* ── Top App Bar ── */}
            <View style={[styles.topBar, SHADOWS.editorial]}>
                <View style={styles.topBarLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <View style={styles.avatarCircle}>
                        <MaterialIcons name="admin-panel-settings" size={22} color={COLORS.primary} />
                    </View>
                    <Text style={styles.topBarTitle}>PetCare Admin</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                {/* ── Hero / Header ── */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Manage Users</Text>
                    <Text style={styles.heroSubtitle}>
                        View registered user accounts, check their details, and remove users when needed.
                    </Text>
                </View>

                {/* ── Stats cards ── */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, SHADOWS.card]}>
                        <MaterialIcons name="people" size={24} color={COLORS.primary} />
                        <Text style={styles.statValue}>{totalUsers}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={[styles.statCard, SHADOWS.card]}>
                        <MaterialIcons name="person" size={24} color="#10b981" />
                        <Text style={styles.statValue}>{regularCount}</Text>
                        <Text style={styles.statLabel}>Users</Text>
                    </View>
                    <View style={[styles.statCard, SHADOWS.card]}>
                        <MaterialIcons name="shield" size={24} color={COLORS.admin} />
                        <Text style={styles.statValue}>{adminCount}</Text>
                        <Text style={styles.statLabel}>Admins</Text>
                    </View>
                </View>

                {/* ── Search bar ── */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={20} color={COLORS.outline} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or email..."
                        placeholderTextColor={COLORS.textPlaceholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialIcons name="close" size={18} color={COLORS.outline} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Filter chips ── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                >
                    <FilterChip label="All" count={totalUsers} active={activeFilter === 'All'} onPress={() => setActiveFilter('All')} />
                    <FilterChip label="Users" count={regularCount} active={activeFilter === 'Users'} onPress={() => setActiveFilter('Users')} />
                    <FilterChip label="Admins" count={adminCount} active={activeFilter === 'Admins'} onPress={() => setActiveFilter('Admins')} />
                </ScrollView>

                {/* ── Empty state ── */}
                {filteredUsers.length === 0 && (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="person-search" size={48} color={COLORS.outlineVariant} />
                        <Text style={styles.emptyStateText}>No users found</Text>
                        <Text style={styles.emptyStateSubtext}>
                            {searchQuery ? `No results for "${searchQuery}"` : 'No users match the selected filter'}
                        </Text>
                    </View>
                )}

                {/* ── User cards ── */}
                {filteredUsers.map((user) => (
                    <UserCard
                        key={user._id}
                        user={user}
                        onPress={() => navigation.navigate('UserDetails', { user })}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    /* Top bar */
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 56,
        paddingBottom: 14,
        backgroundColor: COLORS.surfaceContainerLow,
    },
    topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    backBtn: { padding: 4 },
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topBarTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary, letterSpacing: -0.3 },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    /* Hero */
    heroSection: { marginTop: 28, marginBottom: 20 },
    heroTitle: { fontSize: 34, fontWeight: '800', color: COLORS.secondary, letterSpacing: -0.5 },
    heroSubtitle: { fontSize: 15, color: COLORS.onSurfaceVariant, marginTop: 6, lineHeight: 22, maxWidth: '85%' },

    /* Stats */
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        gap: 4,
    },
    statValue: { fontSize: 24, fontWeight: '800', color: COLORS.secondary, marginTop: 4 },
    statLabel: { fontSize: 10, fontWeight: '800', color: COLORS.outline, textTransform: 'uppercase', letterSpacing: 0.5 },

    /* Search */
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceContainerHigh,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
        marginBottom: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.onSurface,
        padding: 0,
    },

    /* Filter chips */
    chipRow: { flexDirection: 'row', gap: 10, paddingVertical: 16 },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: COLORS.surfaceContainerHigh,
    },
    chipActive: { backgroundColor: COLORS.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: COLORS.secondary },
    chipTextActive: { color: '#fff' },

    /* Empty state */
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyStateText: { fontSize: 18, fontWeight: '700', color: COLORS.secondary, marginTop: 12 },
    emptyStateSubtext: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 4, textAlign: 'center' },

    /* User cards */
    card: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarAdmin: {
        backgroundColor: '#ede9fe',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
    },
    avatarTextAdmin: {
        color: COLORS.admin,
    },
    userInfo: { flex: 1, gap: 2 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    userName: { fontSize: 16, fontWeight: '700', color: COLORS.secondary, flexShrink: 1 },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: COLORS.admin,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    adminBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
    userEmail: { fontSize: 13, color: COLORS.onSurfaceVariant },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    metaText: { fontSize: 11, color: COLORS.outline },
});
