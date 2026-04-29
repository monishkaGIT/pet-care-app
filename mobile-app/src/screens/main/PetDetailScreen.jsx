import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, SafeAreaView, Image, ActivityIndicator, Alert,
    Platform, StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { fetchPetById, deletePet } from '../../api/petApi';

const INFO_ROWS = (pet) => [
    { label: 'Breed', value: pet.breed || '—' },
    { label: 'Color', value: pet.color || '—' },
    { label: 'Gender', value: pet.gender || '—' },
    { label: 'Microchip', value: pet.isMicrochipped ? (pet.microchipNumber || 'Yes') : 'No' },
];

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
        } catch {
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
            'Delete Pet',
            `Are you sure you want to delete ${pet?.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePet(petId);
                            navigation.goBack();
                        } catch {
                            Alert.alert('Error', 'Failed to delete pet.');
                        }
                    }
                }
            ]
        );
    };

    if (loading || !pet) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#30628a" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Header */}
                <View style={styles.heroHeader}>
                    <View style={styles.heroTopBar}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                            <MaterialIcons name="arrow-back" size={24} color="#30628a" />
                        </TouchableOpacity>
                        <Text style={styles.heroBrand}>PetCare</Text>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => navigation.navigate('EditPet', { petId: pet._id })}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons name="edit" size={20} color="#30628a" />
                        </TouchableOpacity>
                    </View>

                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                        {pet.profileImage ? (
                            <Image source={{ uri: pet.profileImage }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <MaterialIcons name="pets" size={64} color="#a2d2ff" />
                            </View>
                        )}
                        {pet.isVaccinated && (
                            <View style={styles.verifiedBadge}>
                                <MaterialIcons name="check" size={14} color="#ffffff" />
                            </View>
                        )}
                    </View>

                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petSub}>
                        {pet.breed || 'Unknown breed'} · {pet.gender || 'Unknown gender'}
                    </Text>
                </View>

                {/* Action Row */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('EditPet', { petId: pet._id })}
                        activeOpacity={0.85}
                    >
                        <MaterialIcons name="edit" size={18} color="#ffffff" />
                        <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnOutline]}
                        onPress={handleDelete}
                        activeOpacity={0.85}
                    >
                        <MaterialIcons name="delete" size={18} color="#30628a" />
                        <Text style={styles.actionBtnOutlineText}>Delete</Text>
                    </TouchableOpacity>
                </View>

                {/* Stat Bento */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statIconWrap}><MaterialIcons name="cake" size={22} color="#79573f" /></View>
                        <Text style={styles.statLabel}>AGE</Text>
                        <Text style={styles.statValue}>{pet.age > 0 ? `${pet.age} Yr${pet.age !== 1 ? 's' : ''}` : 'Unknown'}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={styles.statIconWrap}><MaterialIcons name="fitness-center" size={22} color="#79573f" /></View>
                        <Text style={styles.statLabel}>WEIGHT</Text>
                        <Text style={styles.statValue}>{pet.weight > 0 ? `${pet.weight} kg` : 'Unknown'}</Text>
                    </View>
                </View>

                {/* General Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoCardTitle}>
                        <MaterialIcons name="info" size={18} color="#79573f" />{'  '}General Information
                    </Text>
                    {INFO_ROWS(pet).map((row, i) => (
                        <View key={i} style={[styles.infoRow, i < INFO_ROWS(pet).length - 1 && styles.infoRowBorder]}>
                            <Text style={styles.infoRowLabel}>{row.label}</Text>
                            <Text style={styles.infoRowValue}>{row.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Health Status Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoCardTitle}>
                        <MaterialIcons name="medical-services" size={18} color="#79573f" />{'  '}Health Status
                    </Text>
                    <View style={styles.healthRow}>
                        <View style={styles.healthIconBox}>
                            <MaterialIcons name="vaccines" size={28} color="#30628a" />
                        </View>
                        <View style={styles.healthInfo}>
                            <Text style={styles.healthTitle}>
                                {pet.isVaccinated ? 'Vaccinations Up to Date ✓' : 'Vaccination Status Unknown'}
                            </Text>
                            <Text style={styles.healthSub}>
                                {pet.isNeutered ? 'Neutered/Spayed · ' : ''}
                                {pet.isMicrochipped ? 'Microchipped' : 'Not microchipped'}
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#72787f" />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    scrollContent: { paddingBottom: 80 },
    heroHeader: {
        backgroundColor: '#a2d2ff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
        paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 10, paddingBottom: 40,
        alignItems: 'center', minHeight: 300,
    },
    heroTopBar: {
        width: '100%', flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 28,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
    heroBrand: { fontSize: 20, fontWeight: 'bold', color: '#79573f' },
    editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatar: { width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: '#ffffff' },
    avatarPlaceholder: {
        width: 128, height: 128, borderRadius: 64,
        backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
        borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)',
    },
    verifiedBadge: {
        position: 'absolute', bottom: 4, right: 4,
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#79573f', borderWidth: 3, borderColor: '#a2d2ff',
        alignItems: 'center', justifyContent: 'center',
    },
    petName: { fontSize: 40, fontWeight: '800', color: '#79573f', marginBottom: 6 },
    petSub: { fontSize: 15, color: '#275b82', fontWeight: '500', textTransform: 'capitalize' },
    actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginTop: 20, marginBottom: 4 },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: '#30628a', paddingVertical: 13, borderRadius: 20,
        shadowColor: '#30628a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
    },
    actionBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
    actionBtnOutline: { backgroundColor: '#e9e2d0', shadowOpacity: 0, elevation: 0 },
    actionBtnOutlineText: { color: '#30628a', fontWeight: 'bold', fontSize: 14 },
    statsGrid: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginTop: 20 },
    statCard: {
        flex: 1, backgroundColor: '#ffffff', borderRadius: 16, padding: 18,
        borderWidth: 1, borderColor: '#efe8d5',
        shadowColor: 'rgba(111,78,55,0.04)', shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: 1, elevation: 1,
    },
    statIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#faf3e0', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statLabel: { fontSize: 10, color: '#72787f', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold', marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '800', color: '#1e1c10' },
    infoCard: {
        backgroundColor: '#ffffff', borderRadius: 16, padding: 20, margin: 24, marginBottom: 0,
        borderWidth: 1, borderColor: '#efe8d5',
        shadowColor: 'rgba(111,78,55,0.04)', shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: 1, elevation: 1,
    },
    infoCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#79573f', marginBottom: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#faf3e0' },
    infoRowLabel: { fontSize: 14, color: '#41474e' },
    infoRowValue: { fontSize: 14, fontWeight: '600', color: '#1e1c10' },
    healthRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#faf3e0', padding: 14, borderRadius: 14 },
    healthIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
    healthInfo: { flex: 1 },
    healthTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e1c10', marginBottom: 2 },
    healthSub: { fontSize: 12, color: '#41474e', textTransform: 'capitalize' },
});
