import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Dimensions,
    ActivityIndicator,
    Image,
    Platform,
    StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchServiceById, deleteService } from '../../api/serviceApi';

const { width } = Dimensions.get('window');

export default function ServiceDetailsScreen({ navigation, route }) {
    const serviceId = route?.params?.serviceId;
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadService();
        });

        return unsubscribe;
    }, [navigation, serviceId]);

    const loadService = async () => {
        if (!serviceId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await fetchServiceById(serviceId);
            setService(data);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to load service');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        navigation.navigate('AddNewService', { service });
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Service',
            `Are you sure you want to delete "${service?.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await deleteService(serviceId);
                            Alert.alert('Deleted', 'Service has been deleted successfully.');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete service');
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ],
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: COLORS.onSurfaceVariant }}>Loading service details...</Text>
            </View>
        );
    }

    if (!service) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
                <Text style={{ marginTop: 12, color: COLORS.onSurfaceVariant, fontSize: 16 }}>Service not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
                    <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Format dates
    const createdDate = service.createdAt
        ? new Date(service.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';
    const updatedDate = service.updatedAt
        ? new Date(service.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';

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
                {/* ── Service Image ── */}
                {service.imageUrl && (
                    <Image
                        source={{ uri: service.imageUrl }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                )}

                {/* ── Tags row ── */}
                <View style={styles.tagsRow}>
                    <View style={styles.categoryChip}>
                        <Text style={styles.categoryChipText}>{service.category}</Text>
                    </View>
                    <View style={[styles.statusChip, { backgroundColor: service.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(186,26,26,0.15)' }]}>
                        <View style={[styles.statusDot, { backgroundColor: service.isActive ? '#10b981' : COLORS.error }]} />
                        <Text style={[styles.statusChipText, { color: service.isActive ? '#10b981' : COLORS.error }]}>
                            {service.isActive ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                </View>

                {/* ── Big editorial title ── */}
                <Text style={styles.bigTitle}>{service.name}</Text>

                {/* ── Price & Status cards ── */}
                <View style={styles.infoCardsRow}>
                    <View style={[styles.infoCard, { borderLeftColor: COLORS.primary }]}>
                        <Text style={styles.infoCardLabel}>Price per Session</Text>
                        <Text style={styles.infoCardValue}>
                            ${service.price?.toFixed(2)}
                            <Text style={styles.infoCardUnit}> / session</Text>
                        </Text>
                    </View>
                    <View style={[styles.infoCard, { borderLeftColor: COLORS.secondary }]}>
                        <Text style={styles.infoCardLabel}>Current Availability</Text>
                        <View style={styles.availabilityRow}>
                            <View style={[styles.pulseDot, { backgroundColor: service.isActive ? '#10b981' : COLORS.error }]} />
                            <Text style={styles.infoCardValue}>
                                {service.isActive ? 'Instant Booking' : 'Currently Unavailable'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── Description article ── */}
                <Text style={styles.sectionTitle}>Service Description</Text>
                <Text style={styles.bodyText}>{service.description}</Text>

                {/* ── Admin Controls card ── */}
                <View style={[styles.controlsCard, SHADOWS.editorial]}>
                    <Text style={styles.controlsTitle}>Admin Controls</Text>
                    <TouchableOpacity style={styles.editBtn} activeOpacity={0.85} onPress={handleEdit}>
                        <MaterialIcons name="edit" size={20} color="#fff" />
                        <Text style={styles.editBtnText}>Edit Service</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.deleteBtn, deleting && { opacity: 0.5 }]}
                        activeOpacity={0.85}
                        onPress={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <ActivityIndicator size="small" color={COLORS.error} />
                        ) : (
                            <>
                                <MaterialIcons name="delete" size={20} color={COLORS.error} />
                                <Text style={styles.deleteBtnText}>Delete Service</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* ── Meta info ── */}
                    <View style={styles.metaSection}>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Created By</Text>
                            <Text style={styles.metaValue}>{service.createdBy?.name || 'Admin'}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Created On</Text>
                            <Text style={styles.metaValue}>{createdDate}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Last Modified</Text>
                            <Text style={styles.metaValue}>{updatedDate}</Text>
                        </View>
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
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 56,
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

    scrollContent: { paddingBottom: 48 },

    /* Hero Image */
    heroImage: {
        width: '100%',
        height: 220,
    },

    /* Tags */
    tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, paddingHorizontal: 24 },
    categoryChip: {
        backgroundColor: COLORS.secondaryContainer,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 10,
    },
    categoryChipText: { fontSize: 12, fontWeight: '700', color: COLORS.onSecondaryContainer, textTransform: 'uppercase', letterSpacing: 0.8 },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusChipText: { fontSize: 12, fontWeight: '700' },

    /* Big title */
    bigTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: COLORS.secondary,
        letterSpacing: -0.8,
        lineHeight: 42,
        marginTop: 16,
        marginBottom: 24,
        paddingHorizontal: 24,
    },

    /* Info cards row */
    infoCardsRow: { gap: 12, marginBottom: 28, paddingHorizontal: 24 },
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
    pulseDot: { width: 10, height: 10, borderRadius: 5 },

    /* Description */
    sectionTitle: { fontSize: 24, fontWeight: '800', color: COLORS.secondary, marginBottom: 14, paddingHorizontal: 24 },
    bodyText: { fontSize: 15, color: COLORS.onSurfaceVariant, lineHeight: 24, paddingHorizontal: 24 },

    /* Admin controls card */
    controlsCard: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 20,
        padding: 28,
        marginTop: 32,
        marginHorizontal: 24,
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
});
