import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, SafeAreaView, Image, ActivityIndicator,
    Platform, StatusBar, Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { fetchPetById, deletePet } from '../../api/petApi';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

const { width: SCREEN_W } = Dimensions.get('window');

const INFO_ROWS = (pet) => [
    { label: 'Breed', value: pet.breed || '—', icon: 'category' },
    { label: 'Color', value: pet.color || '—', icon: 'color-lens' },
    { label: 'Gender', value: pet.gender || '—', icon: pet.gender === 'Female' ? 'female' : 'male' },
    { label: 'Microchip', value: pet.isMicrochipped ? (pet.microchipNumber || 'Yes') : 'No', icon: 'nfc' },
];

export default function PetDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { petId } = route.params;
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalProps, showModal] = usePetCareModal();

    const loadPet = async () => {
        try {
            const data = await fetchPetById(petId);
            setPet(data);
        } catch {
            showModal('error', 'Error', 'Failed to load pet details.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadPet();
        }, [petId])
    );

    const handleDelete = () => {
        showModal('warning', 'Delete Pet', `Are you sure you want to delete ${pet?.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deletePet(petId);
                        showModal('success', 'Success', 'Pet deleted successfully!', [
                            { text: 'OK', style: 'primary', onPress: () => navigation.goBack() },
                        ]);
                    } catch {
                        showModal('error', 'Error', 'Failed to delete pet.');
                    }
                }
            }
        ]);
    };

    if (loading || !pet) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#30628a" />
                    <Text style={styles.loadingText}>Loading pet details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <PetCareModal {...modalProps} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── Hero Header ─────────────────────────────────────── */}
                <View style={styles.hero}>
                    {/* Decorative circles */}
                    <View style={styles.heroCircle1} />
                    <View style={styles.heroCircle2} />
                    <View style={styles.heroCircle3} />

                    {/* Top bar */}
                    <View style={styles.heroTopBar}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                            <MaterialIcons name="arrow-back" size={22} color="#30628a" />
                        </TouchableOpacity>
                        <Text style={styles.heroBrand}>PetCare</Text>
                        <TouchableOpacity
                            style={styles.editIconBtn}
                            onPress={() => navigation.navigate('EditPet', { petId: pet._id })}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons name="edit" size={18} color="#30628a" />
                        </TouchableOpacity>
                    </View>

                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarRing}>
                            {pet.profileImage ? (
                                <Image source={{ uri: pet.profileImage }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <MaterialIcons name="pets" size={56} color="#a2d2ff" />
                                </View>
                            )}
                            {pet.isVaccinated && (
                                <View style={styles.verifiedBadge}>
                                    <MaterialIcons name="verified" size={18} color="#22c55e" />
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Pet Name & Subtitle */}
                    <Text style={styles.petName}>{pet.name}</Text>
                    <View style={styles.petSubRow}>
                        <View style={styles.petSubChip}>
                            <MaterialIcons name="category" size={13} color="#275b82" />
                            <Text style={styles.petSubText}>{pet.breed || 'Unknown breed'}</Text>
                        </View>
                        <View style={styles.petSubDot} />
                        <View style={styles.petSubChip}>
                            <MaterialIcons name={pet.gender === 'Female' ? 'female' : 'male'} size={13} color="#275b82" />
                            <Text style={styles.petSubText}>{pet.gender || 'Unknown'}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Quick Actions ────────────────────────────────────── */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('EditPet', { petId: pet._id })}
                        activeOpacity={0.88}
                    >
                        <View style={styles.actionIconWrap}>
                            <MaterialIcons name="edit" size={18} color="#ffffff" />
                        </View>
                        <Text style={styles.actionBtnText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnDanger]}
                        onPress={handleDelete}
                        activeOpacity={0.88}
                    >
                        <View style={[styles.actionIconWrap, styles.actionIconDanger]}>
                            <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
                        </View>
                        <Text style={styles.actionBtnDangerText}>Delete</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Stats Grid ───────────────────────────────────────── */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, styles.statCardWarm]}>
                        <View style={styles.statIconWrap}>
                            <MaterialIcons name="cake" size={22} color="#79573f" />
                        </View>
                        <Text style={styles.statLabel}>AGE</Text>
                        <Text style={styles.statValue}>
                            {pet.age > 0 ? `${pet.age}` : '—'}
                        </Text>
                        <Text style={styles.statUnit}>
                            {pet.age > 0 ? `Year${pet.age !== 1 ? 's' : ''}` : 'Unknown'}
                        </Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardCool]}>
                        <View style={[styles.statIconWrap, { backgroundColor: 'rgba(162,210,255,0.3)' }]}>
                            <MaterialIcons name="fitness-center" size={22} color="#30628a" />
                        </View>
                        <Text style={styles.statLabel}>WEIGHT</Text>
                        <Text style={styles.statValue}>
                            {pet.weight > 0 ? `${pet.weight}` : '—'}
                        </Text>
                        <Text style={styles.statUnit}>
                            {pet.weight > 0 ? 'kg' : 'Unknown'}
                        </Text>
                    </View>
                    <View style={[styles.statCard]}>
                        <View style={[styles.statIconWrap, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                            <MaterialIcons name="favorite" size={22} color="#22c55e" />
                        </View>
                        <Text style={styles.statLabel}>STATUS</Text>
                        <Text style={[styles.statValue, { fontSize: 16 }]}>
                            {pet.isVaccinated ? '✓' : '—'}
                        </Text>
                        <Text style={styles.statUnit}>
                            {pet.isVaccinated ? 'Healthy' : 'Check'}
                        </Text>
                    </View>
                </View>

                {/* ── General Info Card ─────────────────────────────────── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="info-outline" size={18} color="#79573f" />
                        <Text style={styles.cardTitle}>General Information</Text>
                    </View>
                    {INFO_ROWS(pet).map((row, i) => (
                        <View key={i} style={[styles.infoRow, i < INFO_ROWS(pet).length - 1 && styles.infoRowBorder]}>
                            <View style={styles.infoRowLeft}>
                                <View style={styles.infoRowIcon}>
                                    <MaterialIcons name={row.icon} size={16} color="#79573f" />
                                </View>
                                <Text style={styles.infoRowLabel}>{row.label}</Text>
                            </View>
                            <Text style={styles.infoRowValue}>{row.value}</Text>
                        </View>
                    ))}
                </View>

                {/* ── Health Status Card ────────────────────────────────── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="medical-services" size={18} color="#79573f" />
                        <Text style={styles.cardTitle}>Health Status</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.healthRow}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'PetHealth', params: { petId: pet._id } })}
                        activeOpacity={0.85}
                    >
                        <View style={styles.healthIconBox}>
                            <MaterialIcons name="vaccines" size={26} color="#30628a" />
                        </View>
                        <View style={styles.healthInfo}>
                            <Text style={styles.healthTitle}>
                                {pet.isVaccinated ? 'Vaccinations Up to Date' : 'Vaccination Status Unknown'}
                            </Text>
                            <Text style={styles.healthSub}>
                                {pet.isNeutered ? 'Neutered/Spayed · ' : ''}
                                {pet.isMicrochipped ? 'Microchipped' : 'Not microchipped'}
                            </Text>
                        </View>
                        <View style={styles.healthArrow}>
                            <MaterialIcons name="chevron-right" size={20} color="#b0a898" />
                        </View>
                    </TouchableOpacity>

                    {/* Quick health badges */}
                    <View style={styles.healthBadgeRow}>
                        <View style={[styles.healthBadge, pet.isVaccinated && styles.healthBadgeActive]}>
                            <MaterialIcons name="vaccines" size={14} color={pet.isVaccinated ? '#22c55e' : '#b0a898'} />
                            <Text style={[styles.healthBadgeText, pet.isVaccinated && styles.healthBadgeTextActive]}>
                                Vaccinated
                            </Text>
                        </View>
                        <View style={[styles.healthBadge, pet.isNeutered && styles.healthBadgeActive]}>
                            <MaterialIcons name="content-cut" size={14} color={pet.isNeutered ? '#22c55e' : '#b0a898'} />
                            <Text style={[styles.healthBadgeText, pet.isNeutered && styles.healthBadgeTextActive]}>
                                Neutered
                            </Text>
                        </View>
                        <View style={[styles.healthBadge, pet.isMicrochipped && styles.healthBadgeActive]}>
                            <MaterialIcons name="nfc" size={14} color={pet.isMicrochipped ? '#22c55e' : '#b0a898'} />
                            <Text style={[styles.healthBadgeText, pet.isMicrochipped && styles.healthBadgeTextActive]}>
                                Chipped
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── Quick Links ───────────────────────────────────────── */}
                <View style={styles.quickLinksCard}>
                    <TouchableOpacity
                        style={styles.quickLinkRow}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'PetHealth', params: { petId: pet._id } })}
                        activeOpacity={0.85}
                    >
                        <View style={[styles.quickLinkIcon, { backgroundColor: 'rgba(162,210,255,0.25)' }]}>
                            <MaterialIcons name="medical-services" size={20} color="#30628a" />
                        </View>
                        <View style={styles.quickLinkInfo}>
                            <Text style={styles.quickLinkTitle}>Health Records</Text>
                            <Text style={styles.quickLinkSub}>View vaccination & medical history</Text>
                        </View>
                        <MaterialIcons name="arrow-forward-ios" size={14} color="#b0a898" />
                    </TouchableOpacity>

                    <View style={styles.quickLinkDivider} />

                    <TouchableOpacity
                        style={styles.quickLinkRow}
                        onPress={() => navigation.navigate('EditPet', { petId: pet._id })}
                        activeOpacity={0.85}
                    >
                        <View style={[styles.quickLinkIcon, { backgroundColor: '#faf3e0' }]}>
                            <MaterialIcons name="edit-note" size={20} color="#79573f" />
                        </View>
                        <View style={styles.quickLinkInfo}>
                            <Text style={styles.quickLinkTitle}>Edit Details</Text>
                            <Text style={styles.quickLinkSub}>Update profile information</Text>
                        </View>
                        <MaterialIcons name="arrow-forward-ios" size={14} color="#b0a898" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff9ec',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#72787f',
        fontWeight: '500',
    },

    // ── Hero ──
    hero: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 10,
        paddingBottom: 36,
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    heroCircle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    heroCircle2: {
        position: 'absolute',
        top: 30,
        right: 20,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.10)',
    },
    heroCircle3: {
        position: 'absolute',
        bottom: -30,
        left: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(121,87,63,0.06)',
    },
    heroTopBar: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        zIndex: 10,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    heroBrand: {
        fontSize: 20,
        fontWeight: '800',
        color: '#79573f',
    },
    editIconBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.6)',
    },

    // ── Avatar ──
    avatarSection: {
        marginBottom: 16,
        zIndex: 10,
    },
    avatarRing: {
        position: 'relative',
        width: 136,
        height: 136,
        borderRadius: 68,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.7)',
        padding: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 64,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 64,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#efe8d5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    // ── Pet Name ──
    petName: {
        fontSize: 36,
        fontWeight: '900',
        color: '#30628a',
        marginBottom: 10,
        zIndex: 10,
    },
    petSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        zIndex: 10,
    },
    petSubChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.45)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    petSubText: {
        fontSize: 13,
        color: '#275b82',
        fontWeight: '600',
    },
    petSubDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(39,91,130,0.4)',
    },

    // ── Action Buttons ──
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#30628a',
        paddingVertical: 14,
        borderRadius: 16,
        shadowColor: '#30628a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    actionIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },
    actionBtnDanger: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#efe8d5',
        shadowColor: 'rgba(111,78,55,0.06)',
        shadowOpacity: 1,
        elevation: 1,
    },
    actionIconDanger: {
        backgroundColor: 'rgba(239,68,68,0.08)',
    },
    actionBtnDangerText: {
        color: '#ef4444',
        fontWeight: '700',
        fontSize: 14,
    },

    // ── Stats Grid ──
    statsGrid: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#efe8d5',
        shadowColor: 'rgba(111,78,55,0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 1,
        elevation: 1,
    },
    statCardWarm: {
        backgroundColor: '#fff9ec',
    },
    statCardCool: {
        backgroundColor: 'rgba(162,210,255,0.08)',
    },
    statIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#faf3e0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 9,
        color: '#72787f',
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '700',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1e1c10',
    },
    statUnit: {
        fontSize: 11,
        color: '#72787f',
        fontWeight: '600',
        marginTop: 1,
    },

    // ── Cards ──
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#efe8d5',
        shadowColor: 'rgba(111,78,55,0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 1,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#faf3e0',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#79573f',
    },

    // ── Info Rows ──
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 13,
    },
    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#faf3e0',
    },
    infoRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoRowIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#faf3e0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoRowLabel: {
        fontSize: 14,
        color: '#41474e',
        fontWeight: '500',
    },
    infoRowValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e1c10',
    },

    // ── Health ──
    healthRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: '#faf3e0',
        padding: 14,
        borderRadius: 16,
    },
    healthIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#efe8d5',
    },
    healthInfo: {
        flex: 1,
    },
    healthTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e1c10',
        marginBottom: 2,
    },
    healthSub: {
        fontSize: 12,
        color: '#41474e',
        textTransform: 'capitalize',
        fontWeight: '500',
    },
    healthArrow: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    healthBadgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 14,
        flexWrap: 'wrap',
    },
    healthBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#faf3e0',
        borderWidth: 1,
        borderColor: '#efe8d5',
    },
    healthBadgeActive: {
        backgroundColor: 'rgba(34,197,94,0.08)',
        borderColor: 'rgba(34,197,94,0.2)',
    },
    healthBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#b0a898',
    },
    healthBadgeTextActive: {
        color: '#22c55e',
    },

    // ── Quick Links ──
    quickLinksCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#efe8d5',
        overflow: 'hidden',
        shadowColor: 'rgba(111,78,55,0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 1,
        elevation: 1,
    },
    quickLinkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
    },
    quickLinkDivider: {
        height: 1,
        backgroundColor: '#faf3e0',
        marginHorizontal: 16,
    },
    quickLinkIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickLinkInfo: {
        flex: 1,
    },
    quickLinkTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e1c10',
    },
    quickLinkSub: {
        fontSize: 12,
        color: '#72787f',
        marginTop: 2,
        fontWeight: '500',
    },
});
