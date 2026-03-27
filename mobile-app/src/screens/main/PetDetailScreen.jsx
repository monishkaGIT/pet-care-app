import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchPetById, deletePet } from '../../api/petApi';

export default function PetDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { petId } = route.params;
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadPet = async () => {
        try {
            const data = await fetchPetById(petId);
            setPet(data);
        } catch (e) {
            console.error('Failed to load pet', e);
            Alert.alert('Error', 'Failed to load pet details.');
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
        Alert.alert(
            '⚠️ Delete Pet',
            `Are you sure you want to delete ${pet?.name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePet(petId);
                            navigation.goBack();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete pet.');
                        }
                    }
                }
            ]
        );
    };

    if (loading || !pet) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="menu" size={26} color={COLORS.secondary} />
                    </TouchableOpacity>
                    <Text style={styles.headerBrand}>PetCare</Text>
                    <TouchableOpacity style={styles.profileIcon} onPress={() => navigation.navigate('Profile')}>
                        <Ionicons name="person" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Pet Avatar */}
                <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                        <MaterialCommunityIcons name="paw" size={50} color={COLORS.primary} />
                    </View>
                    <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                </View>

                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petSubtitle}>{pet.breed} • {pet.gender}</Text>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => navigation.navigate('EditPet', { petId: pet._id })}
                    >
                        <Ionicons name="pencil" size={16} color="#fff" />
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                        <Ionicons name="trash" size={16} color="#fff" />
                        <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <MaterialCommunityIcons name="scale-bathroom" size={26} color={COLORS.secondary} />
                    <Text style={styles.statLabel}>AGE</Text>
                    <Text style={styles.statValue}>{pet.age} Years</Text>
                </View>
                <View style={styles.statCard}>
                    <MaterialCommunityIcons name="weight-kilogram" size={26} color={COLORS.secondary} />
                    <Text style={styles.statLabel}>WEIGHT</Text>
                    <Text style={styles.statValue}>{pet.weight} kg</Text>
                </View>
            </View>

            {/* General Information */}
            <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                    <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                    <Text style={styles.infoTitle}>General Information</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Breed</Text>
                    <Text style={styles.infoValue}>{pet.breed}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Color</Text>
                    <Text style={styles.infoValue}>{pet.color || '—'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Microchip</Text>
                    <Text style={styles.infoValue}>
                        {pet.isMicrochipped ? (pet.microchipNumber || 'Yes') : 'No'}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Insurance</Text>
                    <Text style={[styles.infoValue, pet.insurance ? { color: '#10b981' } : {}]}>
                        {pet.insurance || 'N/A'}
                    </Text>
                </View>
            </View>

            {/* Health Status */}
            <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                    <MaterialCommunityIcons name="plus-box" size={20} color={COLORS.secondary} />
                    <Text style={styles.infoTitle}>Health Status</Text>
                </View>
                <TouchableOpacity style={styles.healthRow}>
                    <View style={styles.healthIcon}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={22} color={COLORS.secondary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.healthLabel}>
                            {pet.isVaccinated ? 'Vaccinations Up to Date' : 'Vaccinations Pending'}
                        </Text>
                        <Text style={styles.healthSub}>
                            {pet.isVaccinated ? 'Next: Rabies (Oct 2024)' : 'No records yet'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <View style={styles.healthRow}>
                    <View style={styles.healthIcon}>
                        <MaterialCommunityIcons name="needle" size={22} color={COLORS.secondary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.healthLabel}>
                            {pet.isNeutered ? 'Neutered / Spayed' : 'Not Neutered'}
                        </Text>
                        <Text style={styles.healthSub}>
                            {pet.isNeutered ? 'Completed' : 'Status: Pending'}
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.lightGray },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.lightGray },

    // Header
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        alignItems: 'center', ...SHADOWS.header,
    },
    headerTopRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', width: '100%', marginBottom: 18,
    },
    headerBrand: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
    profileIcon: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center',
    },

    // Avatar
    avatarWrap: { alignItems: 'center', marginBottom: 10 },
    avatar: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4,
    },
    checkBadge: {
        position: 'absolute', bottom: 2, right: -2,
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#fff',
    },
    petName: { fontSize: 26, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 6 },
    petSubtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },

    // Action Buttons
    actionRow: { flexDirection: 'row', gap: 14, marginTop: 16 },
    editBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.secondary, paddingVertical: 10, paddingHorizontal: 22,
        borderRadius: 20,
    },
    editBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 14 },
    deleteBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.danger, paddingVertical: 10, paddingHorizontal: 22,
        borderRadius: 20,
    },
    deleteBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 14 },

    // Stats
    statsRow: { flexDirection: 'row', gap: 14, marginHorizontal: 20, marginTop: 20 },
    statCard: {
        flex: 1, backgroundColor: COLORS.surface, borderRadius: 16,
        padding: 16, alignItems: 'center', ...SHADOWS.card,
    },
    statLabel: { fontSize: 11, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 6, letterSpacing: 0.5 },
    statValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 2 },

    // Info Card
    infoCard: {
        backgroundColor: COLORS.surface, marginHorizontal: 20, marginTop: 16,
        borderRadius: 16, padding: 18, ...SHADOWS.card,
    },
    infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    infoTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginLeft: 8 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    infoLabel: { fontSize: 14, color: COLORS.textMuted },
    infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
    divider: { height: 1, backgroundColor: COLORS.inputBorder, marginVertical: 2 },

    // Health
    healthRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    },
    healthIcon: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: COLORS.lightGray, justifyContent: 'center', alignItems: 'center',
    },
    healthLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
    healthSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
