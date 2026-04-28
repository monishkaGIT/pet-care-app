import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Image,
    Platform,
    StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchServices, fetchServiceStats } from '../../api/serviceApi';

const { width } = Dimensions.get('window');

// ── Components ─────────────────────────────────────────────────────

function FilterChip({ label, active, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.chip, active && styles.chipActive]}
        >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
        </TouchableOpacity>
    );
}

// Map category names to MaterialIcons
const CATEGORY_ICONS = {
    'Grooming': 'content-cut',
    'Boarding': 'home',
    'Medical Care': 'medical-services',
    'Training': 'sports',
    'Walking': 'directions-walk',
};

function ServiceCard({ item, onPress }) {
    const iconName = CATEGORY_ICONS[item.category] || 'pets';

    return (
        <TouchableOpacity
            style={[styles.card, SHADOWS.editorial]}
            activeOpacity={0.9}
            onPress={() => onPress(item)}
        >
            {/* Service Image */}
            {item.imageUrl ? (
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
            ) : null}

            {/* Header row */}
            <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                    <MaterialIcons name={iconName} size={28} color={COLORS.primary} />
                </View>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
            </View>

            {/* Body */}
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription} numberOfLines={3}>{item.description}</Text>

            {/* Status indicator */}
            <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: item.isActive ? '#10b981' : COLORS.error }]} />
                <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.priceLabel}>Price</Text>
                    <Text style={styles.priceValue}>Rs. {item.price?.toFixed(2)}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={COLORS.outline} />
            </View>
        </TouchableOpacity>
    );
}

// ── Screen ─────────────────────────────────────────────────────────

export default function ManageServicesScreen({ navigation }) {
    const [services, setServices] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All Services');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Derive unique categories from fetched services
    const categories = ['All Services', ...new Set(services.map((s) => s.category))];

    const loadData = useCallback(async () => {
        try {
            setError(null);
            const [servicesData, statsData] = await Promise.all([
                fetchServices(),
                fetchServiceStats().catch(() => null), // Stats may fail for non-admin
            ]);
            setServices(servicesData);
            if (statsData) setStats(statsData);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load services');
            Alert.alert('Error', err.response?.data?.message || 'Failed to load services');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadData();
        });
        return unsubscribe;
    }, [navigation, loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const filteredServices =
        activeFilter === 'All Services'
            ? services
            : services.filter((s) => s.category === activeFilter);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: COLORS.onSurfaceVariant }}>Loading services...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                    <Text style={styles.heroTitle}>Service Catalog</Text>
                    <Text style={styles.heroSubtitle}>
                        Manage and update your available pet care offerings and pricing structures.
                    </Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('AddNewService')}
                    >
                        <MaterialIcons name="add" size={20} color="#fff" />
                        <Text style={styles.addButtonText}>ADD NEW SERVICE</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Filter chips ── */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                >
                    {categories.map((cat) => (
                        <FilterChip
                            key={cat}
                            label={cat}
                            active={activeFilter === cat}
                            onPress={() => setActiveFilter(cat)}
                        />
                    ))}
                </ScrollView>

                {/* ── Empty state ── */}
                {filteredServices.length === 0 && !loading && (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="search-off" size={48} color={COLORS.outlineVariant} />
                        <Text style={styles.emptyStateText}>No services found</Text>
                        <Text style={styles.emptyStateSubtext}>
                            {activeFilter !== 'All Services'
                                ? `No services in "${activeFilter}" category`
                                : 'Tap "Add New Service" to create your first listing'}
                        </Text>
                    </View>
                )}

                {/* ── Service cards ── */}
                {filteredServices.map((item) => (
                    <ServiceCard
                        key={item._id}
                        item={item}
                        onPress={() => navigation.navigate('ServiceDetails', { serviceId: item._id })}
                    />
                ))}

                {/* ── Stats section ── */}
                {stats && (
                    <View style={styles.statsWrapper}>
                        {/* Dark info card */}
                        <View style={[styles.statsInfoCard, SHADOWS.editorial]}>
                            <MaterialIcons
                                name="pets"
                                size={120}
                                color="rgba(255,255,255,0.08)"
                                style={styles.statsWatermark}
                            />
                            <Text style={styles.statsInfoLabel}>Service Performance</Text>
                            <Text style={styles.statsInfoValue}>Total Active Services: {stats.activeServices}</Text>
                            <View style={styles.statsInfoRow}>
                                <View>
                                    <Text style={styles.statsInfoSubLabel}>Total Services</Text>
                                    <Text style={styles.statsInfoSubValue}>{stats.totalServices}</Text>
                                </View>
                                <View style={styles.statsInfoDivider} />
                                <View>
                                    <Text style={styles.statsInfoSubLabel}>Inactive</Text>
                                    <Text style={styles.statsInfoSubValue}>{stats.inactiveServices}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Category stat tiles */}
                        {stats.categoryCounts && stats.categoryCounts.length > 0 && (
                            <View style={styles.statTileRow}>
                                {stats.categoryCounts.map((cat, i) => (
                                    <View key={i} style={styles.statTile}>
                                        <MaterialIcons
                                            name={CATEGORY_ICONS[cat._id] || 'pets'}
                                            size={22}
                                            color={COLORS.primary}
                                        />
                                        <Text style={styles.statTileValue}>{cat.count}</Text>
                                        <Text style={styles.statTileLabel}>{cat._id}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        marginTop: 20,
        paddingHorizontal: 26,
        paddingVertical: 14,
        borderRadius: 999,
        backgroundColor: COLORS.primary,
        ...SHADOWS.button,
    },
    addButtonText: { color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1.2 },

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

    /* Service cards */
    card: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 16,
        padding: 0,
        marginBottom: 20,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingHorizontal: 24, paddingTop: 20 },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(162,210,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryBadge: {
        backgroundColor: COLORS.secondaryContainer,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
    },
    categoryBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.onSecondaryContainer, textTransform: 'uppercase', letterSpacing: 1.5 },
    cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.secondary, marginBottom: 6, paddingHorizontal: 24 },
    cardDescription: { fontSize: 13, color: COLORS.onSurfaceVariant, lineHeight: 20, marginBottom: 10, paddingHorizontal: 24 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, marginBottom: 8 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 12, fontWeight: '600', color: COLORS.onSurfaceVariant },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 18,
        paddingBottom: 20,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: COLORS.surfaceContainerLow,
    },
    priceLabel: { fontSize: 10, fontWeight: '700', color: COLORS.outline, textTransform: 'uppercase', letterSpacing: 0.5 },
    priceValue: { fontSize: 24, fontWeight: '800', color: COLORS.secondary },
    /* Stats */
    statsWrapper: { marginTop: 32 },
    statsInfoCard: {
        backgroundColor: COLORS.secondary,
        borderRadius: 20,
        padding: 28,
        overflow: 'hidden',
        marginBottom: 16,
    },
    statsWatermark: { position: 'absolute', right: -20, bottom: -20 },
    statsInfoLabel: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
    statsInfoValue: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 6 },
    statsInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20 },
    statsInfoSubLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 },
    statsInfoSubValue: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 2 },
    statsInfoDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
    statTileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statTile: {
        flex: 1,
        minWidth: (width - 70) / 4,
        backgroundColor: COLORS.surfaceContainerHigh,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },
    statTileValue: { fontSize: 22, fontWeight: '800', color: COLORS.secondary, marginTop: 6 },
    statTileLabel: { fontSize: 10, fontWeight: '800', color: COLORS.outline, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
});
