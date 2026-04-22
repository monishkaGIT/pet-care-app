import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// ── Fallback data when no route param is supplied ──────────────────
const DEFAULT_SERVICE = {
    name: 'Luxury Grooming',
    category: 'Grooming & Spa',
    price: '$125.00',
    priceLabel: 'Standard Rate',
    description:
        'Our Luxury Grooming service is designed for the discerning pet owner who seeks nothing but the absolute best for their furry companion. This comprehensive session goes far beyond a simple bath; it is a holistic wellness experience tailored to the specific needs of your pet\'s coat and skin.',
    descriptionExtra:
        'Every session begins with a detailed physical assessment and a therapeutic warm-water massage using organic, botanical-infused shampoos. We utilize hand-drying techniques to ensure a stress-free environment, avoiding the noise and heat of industrial dryers.',
    features: [
        { title: 'Aromatherapy Bath', subtitle: 'Calming lavender and chamomile essence.' },
        { title: 'Precision Scissoring', subtitle: 'Hand-finished cut by master stylists.' },
        { title: 'Nail Buffing', subtitle: 'Smooth, rounded edges for comfort.' },
        { title: 'Ear Deep-Clean', subtitle: 'Medical-grade hygiene maintenance.' },
    ],
    meta: {
        createdBy: 'Head Admin',
        lastModified: 'Oct 12, 2023',
        totalBookings: '1,248',
    },
};

export default function ServiceDetailsScreen({ navigation, route }) {
    const service = route?.params?.service ?? DEFAULT_SERVICE;

    const handleEdit = () => {
        navigation.navigate('AddNewService', { service });
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Service',
            `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => navigation.goBack() },
            ],
        );
    };

    return (
        <View style={styles.container}>
            {/* ── Top App Bar ── */}
            <View style={[styles.topBar, SHADOWS.editorial]}>
                <View style={styles.topBarLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.topBarTitle}>PetCare Admin</Text>
                </View>
                <View style={styles.topBarRight}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>AD</Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7}>
                        <MaterialIcons name="settings" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* ── Tags row ── */}
                <View style={styles.tagsRow}>
                    <View style={styles.categoryChip}>
                        <Text style={styles.categoryChipText}>{service.category || 'Grooming & Spa'}</Text>
                    </View>
                    <View style={styles.premiumChip}>
                        <MaterialIcons name="star" size={16} color={COLORS.onTertiaryContainer} />
                        <Text style={styles.premiumChipText}>Premium Tier</Text>
                    </View>
                </View>

                {/* ── Big editorial title ── */}
                <Text style={styles.bigTitle}>{service.name || 'Luxury Grooming'}</Text>

                {/* ── Price & Status cards ── */}
                <View style={styles.infoCardsRow}>
                    <View style={[styles.infoCard, { borderLeftColor: COLORS.primary }]}>
                        <Text style={styles.infoCardLabel}>{service.priceLabel || 'Standard Rate'}</Text>
                        <Text style={styles.infoCardValue}>
                            {service.price || '$125.00'}
                            <Text style={styles.infoCardUnit}> / session</Text>
                        </Text>
                    </View>
                    <View style={[styles.infoCard, { borderLeftColor: COLORS.secondary }]}>
                        <Text style={styles.infoCardLabel}>Current Availability</Text>
                        <View style={styles.availabilityRow}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.infoCardValue}>Instant Booking</Text>
                        </View>
                    </View>
                </View>

                {/* ── Description article ── */}
                <Text style={styles.sectionTitle}>The Royal Treatment for Your Companion</Text>
                <Text style={styles.bodyText}>
                    {service.description || DEFAULT_SERVICE.description}
                </Text>
                <Text style={[styles.bodyText, { marginTop: 12 }]}>
                    {service.descriptionExtra || DEFAULT_SERVICE.descriptionExtra}
                </Text>

                {/* ── Feature list ── */}
                <View style={styles.featureGrid}>
                    {(service.features || DEFAULT_SERVICE.features).map((f, i) => (
                        <View key={i} style={styles.featureItem}>
                            <View style={styles.featureIconCircle}>
                                <MaterialIcons name="check-circle" size={22} color={COLORS.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.featureTitle}>{f.title}</Text>
                                <Text style={styles.featureSubtitle}>{f.subtitle}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── Admin Controls card ── */}
                <View style={[styles.controlsCard, SHADOWS.editorial]}>
                    <Text style={styles.controlsTitle}>Admin Controls</Text>
                    <TouchableOpacity style={styles.editBtn} activeOpacity={0.85} onPress={handleEdit}>
                        <MaterialIcons name="edit" size={20} color="#fff" />
                        <Text style={styles.editBtnText}>Edit Service</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.85} onPress={handleDelete}>
                        <MaterialIcons name="delete" size={20} color={COLORS.error} />
                        <Text style={styles.deleteBtnText}>Delete Service</Text>
                    </TouchableOpacity>

                    {/* ── Meta info ── */}
                    <View style={styles.metaSection}>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Created By</Text>
                            <Text style={styles.metaValue}>{(service.meta || DEFAULT_SERVICE.meta).createdBy}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Last Modified</Text>
                            <Text style={styles.metaValue}>{(service.meta || DEFAULT_SERVICE.meta).lastModified}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Total Bookings</Text>
                            <Text style={[styles.metaValue, { color: COLORS.primary, fontWeight: '800' }]}>
                                {(service.meta || DEFAULT_SERVICE.meta).totalBookings}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── Performance banner ── */}
                <View style={[styles.performanceBanner, SHADOWS.editorial]}>
                    <MaterialIcons
                        name="analytics"
                        size={100}
                        color="rgba(255,255,255,0.08)"
                        style={styles.bannerWatermark}
                    />
                    <Text style={styles.bannerLabel}>Service Performance</Text>
                    <Text style={styles.bannerTitle}>Growing Popularity</Text>
                    <Text style={styles.bannerBody}>
                        This service has seen a 24% increase in bookings over the last 30 days. Consider promoting it during weekends.
                    </Text>
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
    topBarTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary, letterSpacing: -0.3 },
    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { fontWeight: '800', color: COLORS.onPrimaryContainer, fontSize: 13 },

    scrollContent: { paddingHorizontal: 24, paddingBottom: 48 },

    /* Tags */
    tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28 },
    categoryChip: {
        backgroundColor: COLORS.secondaryContainer,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 10,
    },
    categoryChipText: { fontSize: 12, fontWeight: '700', color: COLORS.onSecondaryContainer, textTransform: 'uppercase', letterSpacing: 0.8 },
    premiumChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,192,146,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    premiumChipText: { fontSize: 12, fontWeight: '700', color: COLORS.onTertiaryContainer },

    /* Big title */
    bigTitle: {
        fontSize: 42,
        fontWeight: '800',
        color: COLORS.secondary,
        letterSpacing: -0.8,
        lineHeight: 48,
        marginTop: 16,
        marginBottom: 24,
    },

    /* Info cards row */
    infoCardsRow: { gap: 12, marginBottom: 28 },
    infoCard: {
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 14,
        padding: 22,
        borderLeftWidth: 4,
    },
    infoCardLabel: { fontSize: 10, fontWeight: '800', color: COLORS.secondary, textTransform: 'uppercase', letterSpacing: 1.5 },
    infoCardValue: { fontSize: 26, fontWeight: '800', color: COLORS.primary, marginTop: 4 },
    infoCardUnit: { fontSize: 14, fontWeight: '400', color: COLORS.onSurfaceVariant },
    availabilityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
    pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981' },

    /* Description */
    sectionTitle: { fontSize: 24, fontWeight: '800', color: COLORS.secondary, marginBottom: 14 },
    bodyText: { fontSize: 15, color: COLORS.onSurfaceVariant, lineHeight: 24 },

    /* Feature grid */
    featureGrid: { marginTop: 24, gap: 16 },
    featureItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
    featureIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureTitle: { fontSize: 15, fontWeight: '700', color: COLORS.secondary },
    featureSubtitle: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 2 },

    /* Admin controls card */
    controlsCard: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 20,
        padding: 28,
        marginTop: 32,
    },
    controlsTitle: { fontSize: 22, fontWeight: '800', color: COLORS.secondary, marginBottom: 20 },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 999,
        marginBottom: 12,
        // gold gradient approximation
        backgroundColor: COLORS.onTertiaryContainer,
    },
    editBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: COLORS.error,
    },
    deleteBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 16 },

    /* Meta */
    metaSection: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.surfaceContainerHigh, gap: 16 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metaLabel: { fontSize: 12, fontWeight: '800', color: COLORS.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    metaValue: { fontSize: 14, fontWeight: '500', color: COLORS.onSurfaceVariant },

    /* Performance banner */
    performanceBanner: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: 28,
        marginTop: 20,
        overflow: 'hidden',
    },
    bannerWatermark: { position: 'absolute', right: -16, bottom: -16 },
    bannerLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(205,229,255,0.8)', textTransform: 'uppercase', letterSpacing: 1.5 },
    bannerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 4 },
    bannerBody: { fontSize: 13, color: 'rgba(205,229,255,0.85)', lineHeight: 20, marginTop: 8 },
});
