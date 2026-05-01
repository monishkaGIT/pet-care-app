import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, StatusBar,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../../constants/theme';
import {
    fetchHealthRecordById,
    updateHealthRecord,
    deleteHealthRecord,
} from '../../api/healthApi';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

export default function HealthRecordDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { petId, recordId } = route.params;

    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalProps, showModal] = usePetCareModal();

    useEffect(() => {
        loadRecord();
    }, []);

    const loadRecord = async () => {
        try {
            setLoading(true);
            const data = await fetchHealthRecordById(petId, recordId);
            setRecord(data);
        } catch (err) {
            console.error('Error loading record:', err);
            showModal('error', 'Error', 'Could not load health record');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        showModal('warning', 'Delete Record', 'Are you sure you want to delete this health record? This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteHealthRecord(petId, recordId);
                        showModal('success', 'Deleted', 'Record removed successfully', [
                            { text: 'OK', style: 'primary', onPress: () => navigation.goBack() },
                        ]);
                    } catch (err) {
                        showModal('error', 'Error', 'Failed to delete record');
                    }
                },
            },
        ]);
    };

    const handleToggleStatus = async () => {
        try {
            const newStatus = record.status === 'active' ? 'resolved' : 'active';
            const updated = await updateHealthRecord(petId, recordId, { status: newStatus });
            setRecord(updated);
        } catch (err) {
            showModal('error', 'Error', 'Failed to update status');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!record) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
                <Text style={styles.errorText}>Record not found</Text>
            </View>
        );
    }

    const initials = record.vetName
        ? record.vetName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'DR';

    return (
        <View style={styles.container}>
            <PetCareModal {...modalProps} />
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Record Details</Text>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── Visit Date & Type Badge ─── */}
                <View style={styles.visitDateSection}>
                    <View>
                        <Text style={styles.visitDateLabel}>VISIT DATE</Text>
                        <Text style={styles.visitDateValue}>{formatDate(record.visitDate)}</Text>
                        {record.clinicName ? (
                            <Text style={styles.clinicName}>{record.clinicName}</Text>
                        ) : null}
                    </View>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>
                            {record.title || 'Medical Record'}
                        </Text>
                    </View>
                </View>

                {/* ─── Diagnosis Card ─── */}
                {record.diagnosis ? (
                    <View style={styles.detailCard}>
                        <View style={styles.cardIconRow}>
                            <View style={[styles.cardIcon, { backgroundColor: '#e3f2fd' }]}>
                                <Ionicons name="search" size={22} color={COLORS.primary} />
                            </View>
                            <Text style={styles.cardTitle}>Diagnosis</Text>
                        </View>
                        <Text style={styles.cardBody}>{record.diagnosis}</Text>
                    </View>
                ) : null}

                {/* ─── Treatment Card ─── */}
                {record.treatment && record.treatment.length > 0 ? (
                    <View style={styles.detailCard}>
                        <View style={styles.cardIconRow}>
                            <View style={[styles.cardIcon, { backgroundColor: '#fff3e0' }]}>
                                <FontAwesome5 name="notes-medical" size={18} color={COLORS.secondary} />
                            </View>
                            <Text style={styles.cardTitle}>Treatment</Text>
                        </View>
                        {record.treatment.map((item, index) => (
                            <View key={index} style={styles.treatmentItem}>
                                <View style={styles.treatmentDot} />
                                <Text style={styles.treatmentText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* ─── Medicines Card ─── */}
                {record.medicines && record.medicines.length > 0 ? (
                    <View style={styles.detailCard}>
                        <View style={styles.cardIconRow}>
                            <View style={[styles.cardIcon, { backgroundColor: '#f3e5f5' }]}>
                                <FontAwesome5 name="pills" size={18} color="#7b1fa2" />
                            </View>
                            <Text style={styles.cardTitle}>Medicines Prescribed</Text>
                        </View>
                        {record.medicines.map((med, index) => (
                            <View key={index} style={styles.medicineRow}>
                                <View style={styles.medicineInfo}>
                                    <Text style={styles.medicineName}>{med.name}</Text>
                                    {med.dosage ? (
                                        <Text style={styles.medicineDosage}>{med.dosage}</Text>
                                    ) : null}
                                </View>
                                <FontAwesome5
                                    name={med.icon === 'pill' ? 'capsules' : 'prescription-bottle-alt'}
                                    size={18}
                                    color={COLORS.primary}
                                />
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* ─── Vet Notes Card ─── */}
                {record.notes ? (
                    <View style={styles.vetNotesSection}>
                        <View style={styles.vetNotesHeader}>
                            <FontAwesome5 name="clipboard-list" size={18} color={COLORS.secondary} />
                            <Text style={styles.vetNotesTitle}>Vet Notes</Text>
                        </View>
                        <Text style={styles.vetNotesBody}>"{record.notes}"</Text>
                        {record.vetName ? (
                            <View style={styles.vetInfoRow}>
                                <View style={styles.vetAvatar}>
                                    <Text style={styles.vetAvatarText}>{initials}</Text>
                                </View>
                                <View>
                                    <Text style={styles.vetNameText}>{record.vetName}</Text>
                                    {record.vetTitle ? (
                                        <Text style={styles.vetTitleText}>{record.vetTitle}</Text>
                                    ) : null}
                                </View>
                            </View>
                        ) : null}
                    </View>
                ) : null}

                {/* ─── Status Toggle ─── */}
                <View style={styles.statusSection}>
                    <Text style={styles.statusLabel}>Status:</Text>
                    <TouchableOpacity
                        style={[
                            styles.statusToggle,
                            record.status === 'active' ? styles.statusToggleActive : styles.statusToggleResolved
                        ]}
                        onPress={handleToggleStatus}
                    >
                        <Text style={[
                            styles.statusToggleText,
                            record.status === 'active' ? styles.statusToggleTextActive : styles.statusToggleTextResolved
                        ]}>
                            {record.status === 'active' ? '● ACTIVE' : '✓ RESOLVED'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Action Buttons ─── */}
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('NewHealthRecord', {
                        petId,
                        editRecord: record,
                    })}
                >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={styles.editButtonText}>Edit Record</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                    <Text style={styles.deleteButtonText}>Delete Record</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.error,
        marginTop: 12,
    },

    // ─── Header ───
    header: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },

    // ─── Scroll ───
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },

    // ─── Visit Date ───
    visitDateSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    visitDateLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.textMuted,
        letterSpacing: 1,
        marginBottom: 4,
    },
    visitDateValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.onSurface,
    },
    clinicName: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    typeBadge: {
        backgroundColor: COLORS.primaryContainer,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        maxWidth: 140,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.onPrimaryContainer,
        textAlign: 'center',
    },

    // ─── Detail Cards ───
    detailCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 20,
        marginBottom: 16,
        ...SHADOWS.card,
    },
    cardIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 12,
    },
    cardIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.onSurface,
    },
    cardBody: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },

    // ─── Treatment ───
    treatmentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 10,
    },
    treatmentDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
        marginTop: 6,
    },
    treatmentText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },

    // ─── Medicines ───
    medicineRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
    },
    medicineInfo: {
        flex: 1,
    },
    medicineName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.onSurface,
    },
    medicineDosage: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 2,
    },

    // ─── Vet Notes ───
    vetNotesSection: {
        marginBottom: 20,
    },
    vetNotesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    vetNotesTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: COLORS.onSurface,
    },
    vetNotesBody: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        lineHeight: 22,
        marginBottom: 16,
    },
    vetInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    vetAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vetAvatarText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    vetNameText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.onSurface,
    },
    vetTitleText: {
        fontSize: 12,
        color: COLORS.textMuted,
    },

    // ─── Status ───
    statusSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    statusToggle: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusToggleActive: {
        backgroundColor: '#e8f5e9',
    },
    statusToggleResolved: {
        backgroundColor: COLORS.surfaceContainerHigh,
    },
    statusToggleText: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    statusToggleTextActive: {
        color: '#2e7d32',
    },
    statusToggleTextResolved: {
        color: COLORS.textMuted,
    },

    // ─── Buttons ───
    editButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 30,
        paddingVertical: 16,
        gap: 8,
        ...SHADOWS.button,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    deleteButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        paddingVertical: 14,
        marginTop: 12,
        borderWidth: 2,
        borderColor: COLORS.error,
        gap: 8,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.error,
    },
});
