import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// ── Dummy data (mirrors the HTML) ──────────────────────────────────
const CATEGORIES = ['All Services', 'Grooming', 'Medical', 'Boarding', 'Training'];

const SERVICES = [
    {
        id: '1',
        name: 'Full Spa Experience',
        category: 'Grooming',
        description: 'Deep cleaning, nail trimming, and styling tailored to specific breed standards.',
        priceLabel: 'Starting at',
        price: '$65.00',
        icon: 'content-cut',
    },
    {
        id: '2',
        name: 'Luxury Suite Stay',
        category: 'Boarding',
        description: 'Climate controlled private rooms with 24/7 monitoring and daily play sessions.',
        priceLabel: 'Daily Rate',
        price: '$45.00',
        icon: 'home',
    },
    {
        id: '3',
        name: 'Behavioral Therapy',
        category: 'Training',
        description: 'Professional one-on-one sessions focusing on positive reinforcement and socialization techniques.',
        priceLabel: 'Per Session',
        price: '$120.00',
        icon: 'sports',
        features: ['Puppy Foundation', 'Advanced Obedience'],
    },
    {
        id: '4',
        name: 'Wellness Exam',
        category: 'Medical',
        description: 'Comprehensive health screening, vaccinations, and parasite prevention consultations.',
        priceLabel: 'Exam Fee',
        price: '$80.00',
        icon: 'medical-services',
    },
    {
        id: '5',
        name: 'Urban Expedition',
        category: 'Exercise',
        description: 'Energetic 60-minute neighborhood walks with GPS tracking and photo updates for owners.',
        priceLabel: 'Per Walk',
        price: '$30.00',
        icon: 'directions-walk',
    },
];

const STATS = [
    { icon: 'bolt', value: '8', label: 'Express' },
    { icon: 'verified-user', value: '4', label: 'Premium' },
    { icon: 'group-add', value: '2', label: 'Group' },
    { icon: 'star', value: '12', label: 'Certified' },
];

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

function ServiceCard({ item, onEdit }) {
    return (
        <View style={[styles.card, SHADOWS.editorial]}>
            {/* Header row */}
            <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                    <MaterialIcons name={item.icon} size={28} color={COLORS.primary} />
                </View>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
            </View>

            {/* Body */}
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>

            {/* Optional features list */}
            {item.features && item.features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                    <MaterialIcons name="check-circle" size={18} color={COLORS.primary} />
                    <Text style={styles.featureText}>{f}</Text>
                </View>
            ))}

            {/* Footer */}
            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.priceLabel}>{item.priceLabel}</Text>
                    <Text style={styles.priceValue}>{item.price}</Text>
                </View>
                <TouchableOpacity style={styles.editButton} activeOpacity={0.7} onPress={() => onEdit(item)}>
                    <MaterialIcons name="edit" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ── Screen ─────────────────────────────────────────────────────────

export default function ManageServicesScreen({ navigation }) {
    const [activeFilter, setActiveFilter] = useState('All Services');

    const filteredServices =
        activeFilter === 'All Services'
            ? SERVICES
            : SERVICES.filter((s) => s.category === activeFilter);

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
                <TouchableOpacity activeOpacity={0.7}>
                    <MaterialIcons name="settings" size={22} color={COLORS.onSurfaceVariant} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                    {CATEGORIES.map((cat) => (
                        <FilterChip
                            key={cat}
                            label={cat}
                            active={activeFilter === cat}
                            onPress={() => setActiveFilter(cat)}
                        />
                    ))}
                </ScrollView>

                {/* ── Service cards ── */}
                {filteredServices.map((item) => (
                    <ServiceCard
                        key={item.id}
                        item={item}
                        onEdit={() => navigation.navigate('ServiceDetails', { service: item })}
                    />
                ))}

                {/* ── Stats section ── */}
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
                        <Text style={styles.statsInfoValue}>Total Active Services: 12</Text>
                        <View style={styles.statsInfoRow}>
                            <View>
                                <Text style={styles.statsInfoSubLabel}>Revenue Boost</Text>
                                <Text style={styles.statsInfoSubValue}>+14%</Text>
                            </View>
                            <View style={styles.statsInfoDivider} />
                            <View>
                                <Text style={styles.statsInfoSubLabel}>Customer Satisfaction</Text>
                                <Text style={styles.statsInfoSubValue}>4.9/5</Text>
                            </View>
                        </View>
                    </View>

                    {/* Small stat tiles */}
                    <View style={styles.statTileRow}>
                        {STATS.map((s, i) => (
                            <View key={i} style={styles.statTile}>
                                <MaterialIcons name={s.icon} size={22} color={COLORS.primary} />
                                <Text style={styles.statTileValue}>{s.value}</Text>
                                <Text style={styles.statTileLabel}>{s.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
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
        paddingTop: 56,
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

    /* Service cards */
    card: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
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
    cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.secondary, marginBottom: 6 },
    cardDescription: { fontSize: 13, color: COLORS.onSurfaceVariant, lineHeight: 20, marginBottom: 10 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    featureText: { fontSize: 13, color: COLORS.onSurfaceVariant },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 18,
        paddingTop: 18,
        borderTopWidth: 1,
        borderTopColor: COLORS.surfaceContainerLow,
    },
    priceLabel: { fontSize: 10, fontWeight: '700', color: COLORS.outline, textTransform: 'uppercase', letterSpacing: 0.5 },
    priceValue: { fontSize: 24, fontWeight: '800', color: COLORS.secondary },
    editButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.surfaceContainerHigh,
        alignItems: 'center',
        justifyContent: 'center',
    },

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
