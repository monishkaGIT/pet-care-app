import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchUserPets } from '../../api/petApi';
import {
    fetchHealthSummary,
    fetchHealthRecords,
    fetchVaccinations,
} from '../../api/healthApi';

export default function PetHealthScreen() {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext);

    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);
    const [showPetPicker, setShowPetPicker] = useState(false);
    const [summary, setSummary] = useState(null);
    const [records, setRecords] = useState([]);
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Load user's pets
    const loadPets = async () => {
        try {
            const data = await fetchUserPets();
            setPets(data);
            if (data.length > 0 && !selectedPet) {
                setSelectedPet(data[0]);
            }
        } catch (err) {
            console.error('Error loading pets:', err);
        }
    };

    // Load health data for selected pet
    const loadHealthData = async (petId) => {
        try {
            const [summaryData, recordsData, vaccinationsData] = await Promise.all([
                fetchHealthSummary(petId),
                fetchHealthRecords(petId),
                fetchVaccinations(petId),
            ]);
            setSummary(summaryData);
            setRecords(recordsData);
            setVaccinations(vaccinationsData);
        } catch (err) {
            console.error('Error loading health data:', err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const init = async () => {
                setLoading(true);
                await loadPets();
                setLoading(false);
            };
            init();
        }, [])
    );

    useEffect(() => {
        if (selectedPet?._id) {
            loadHealthData(selectedPet._id);
        }
    }, [selectedPet]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPets();
        if (selectedPet?._id) {
            await loadHealthData(selectedPet._id);
        }
        setRefreshing(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    const formatShortDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const formatDay = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).getDate();
    };

    const formatMonth = (dateStr) => {
        if (!dateStr) return '';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[new Date(dateStr).getMonth()];
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (pets.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="medkit-outline" size={64} color={COLORS.primary} />
                <Text style={styles.emptyText}>Add a pet first to track health</Text>
                <TouchableOpacity
                    style={styles.addPetButton}
                    onPress={() => navigation.navigate('AddPet')}
                >
                    <Text style={styles.addPetButtonText}>Add Pet</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* ─── Header ─── */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <FontAwesome5 name="paw" size={20} color="#fff" />
                    <Text style={styles.headerTitle}>Pet Health</Text>
                </View>
                <TouchableOpacity onPress={onRefresh}>
                    <Ionicons name="notifications-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            >
                {/* ─── Pet Picker ─── */}
                {pets.length > 1 && (
                    <TouchableOpacity
                        style={styles.petPickerBtn}
                        onPress={() => setShowPetPicker(!showPetPicker)}
                    >
                        <FontAwesome5 name="dog" size={16} color={COLORS.primary} />
                        <Text style={styles.petPickerText}>{selectedPet?.name || 'Select Pet'}</Text>
                        <MaterialIcons name={showPetPicker ? "expand-less" : "expand-more"} size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                )}

                {showPetPicker && (
                    <View style={styles.petPickerDropdown}>
                        {pets.map((pet) => (
                            <TouchableOpacity
                                key={pet._id}
                                style={[
                                    styles.petPickerItem,
                                    selectedPet?._id === pet._id && styles.petPickerItemActive
                                ]}
                                onPress={() => {
                                    setSelectedPet(pet);
                                    setShowPetPicker(false);
                                }}
                            >
                                <FontAwesome5
                                    name={pet.type?.toLowerCase() === 'cat' ? 'cat' : 'dog'}
                                    size={14}
                                    color={selectedPet?._id === pet._id ? '#fff' : COLORS.primary}
                                />
                                <Text style={[
                                    styles.petPickerItemText,
                                    selectedPet?._id === pet._id && styles.petPickerItemTextActive
                                ]}>{pet.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* ─── Quick Stats ─── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Stats</Text>
                    <Text style={styles.sectionSubtitle}>Last updated: Today</Text>
                </View>

                <View style={styles.statsRow}>
                    {/* Weight Card */}
                    <View style={[styles.statCard, styles.statCardWeight]}>
                        <View style={styles.statIconContainer}>
                            <FontAwesome5 name="weight" size={18} color={COLORS.primary} />
                        </View>
                        <Text style={styles.statLabel}>Weight</Text>
                        <Text style={styles.statValue}>
                            {summary?.currentWeight || 0}
                            <Text style={styles.statUnit}> {summary?.weightUnit || 'kg'}</Text>
                        </Text>
                        {summary?.weightChange !== null && summary?.weightChange !== undefined && (
                            <Text style={[
                                styles.statChange,
                                { color: summary.weightChange >= 0 ? COLORS.success : COLORS.error }
                            ]}>
                                {summary.weightChange >= 0 ? '↑' : '↓'}{Math.abs(summary.weightChange)}kg from last month
                            </Text>
                        )}
                    </View>

                    {/* Last Check-up Card */}
                    <View style={[styles.statCard, styles.statCardCheckup]}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.statLabel}>Last Check-up</Text>
                        {summary?.lastCheckup ? (
                            <>
                                <Text style={styles.statDay}>{formatDay(summary.lastCheckup.date)}</Text>
                                <Text style={styles.statMonth}>{formatMonth(summary.lastCheckup.date)}</Text>
                                <Text style={styles.statCheckupTitle}>{summary.lastCheckup.title}</Text>
                            </>
                        ) : (
                            <Text style={styles.statCheckupTitle}>No records yet</Text>
                        )}
                    </View>
                </View>

                {/* ─── Health Records ─── */}
                <Text style={styles.sectionTitle}>Health Records</Text>

                {records.length === 0 ? (
                    <View style={styles.emptySection}>
                        <Ionicons name="document-text-outline" size={32} color={COLORS.outline} />
                        <Text style={styles.emptySectionText}>No health records yet</Text>
                    </View>
                ) : (
                    records.map((record) => (
                        <TouchableOpacity
                            key={record._id}
                            style={styles.recordCard}
                            onPress={() => navigation.navigate('HealthRecordDetail', {
                                petId: selectedPet._id,
                                recordId: record._id,
                            })}
                        >
                            <View style={styles.recordIconContainer}>
                                <Ionicons
                                    name={record.recordType === 'vaccination' ? 'shield-checkmark' : 'medkit'}
                                    size={24}
                                    color={COLORS.primary}
                                />
                            </View>
                            <View style={styles.recordContent}>
                                <View style={styles.recordHeaderRow}>
                                    <Text style={styles.recordTitle}>{record.title}</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        record.status === 'active' ? styles.statusActive : styles.statusResolved
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            record.status === 'active' ? styles.statusTextActive : styles.statusTextResolved
                                        ]}>
                                            {record.status?.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                {record.notes ? (
                                    <Text style={styles.recordDescription} numberOfLines={2}>
                                        Treatment: {record.notes}
                                    </Text>
                                ) : null}
                                <Text style={styles.recordMeta}>
                                    {record.vetName ? `${record.vetName} • ` : ''}{formatShortDate(record.visitDate)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {/* ─── Vaccination Passport ─── */}
                <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionTitleRow}>
                        <FontAwesome5 name="syringe" size={16} color={COLORS.secondary} />
                        <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Vaccination Passport</Text>
                    </View>
                </View>

                {vaccinations.length === 0 ? (
                    <View style={styles.emptySection}>
                        <Ionicons name="shield-outline" size={32} color={COLORS.outline} />
                        <Text style={styles.emptySectionText}>No vaccinations recorded</Text>
                    </View>
                ) : (
                    <View style={styles.vaccinationTable}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>VACCINE NAME</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>ADMINISTERED</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>NEXT DUE</Text>
                        </View>

                        {/* Table Rows */}
                        {vaccinations.map((vac) => (
                            <View key={vac._id} style={styles.tableRow}>
                                <View style={{ flex: 2 }}>
                                    <Text style={styles.vaccineName}>{vac.vaccineName}</Text>
                                    {vac.lotNumber ? (
                                        <Text style={styles.vaccineLot}>{vac.lotNumber}</Text>
                                    ) : null}
                                </View>
                                <Text style={[styles.vaccineDate, { flex: 1.5 }]}>
                                    {formatDate(vac.administeredDate)}
                                </Text>
                                <Text style={[styles.vaccineDate, { flex: 1 }]}>
                                    {formatShortDate(vac.nextDueDate)}
                                </Text>
                            </View>
                        ))}

                        {/* Verified Footer */}
                        <View style={styles.verifiedFooter}>
                            <View style={styles.verifiedLeft}>
                                <Ionicons name="shield-checkmark" size={18} color={COLORS.success} />
                                <Text style={styles.verifiedText}>VERIFIED DIGITAL RECORD</Text>
                            </View>
                            <TouchableOpacity>
                                <Text style={styles.downloadLink}>Download PDF</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Bottom Padding */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* ─── FAB — Add New Record ─── */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('NewHealthRecord', { petId: selectedPet?._id })}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 18,
        color: COLORS.secondary,
        fontWeight: 'bold',
        marginTop: 16,
    },
    addPetButton: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 25,
    },
    addPetButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // ─── Header ───
    header: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },

    // ─── Scroll ───
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },

    // ─── Pet Picker ───
    petPickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceContainerLow,
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    petPickerText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.onSurface,
    },
    petPickerDropdown: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        ...SHADOWS.card,
    },
    petPickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.outlineVariant,
    },
    petPickerItemActive: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
    },
    petPickerItemText: {
        fontSize: 15,
        color: COLORS.onSurface,
        fontWeight: '500',
    },
    petPickerItemTextActive: {
        color: '#fff',
    },

    // ─── Section Headers ───
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.onSurface,
        marginBottom: 12,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // ─── Stats Cards ───
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        ...SHADOWS.card,
    },
    statCardWeight: {},
    statCardCheckup: {},
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.primaryContainer + '40',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.onSurface,
    },
    statUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    statChange: {
        fontSize: 11,
        marginTop: 4,
        fontWeight: '500',
    },
    statDay: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.onSurface,
    },
    statMonth: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    statCheckupTitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
    },

    // ─── Empty Section ───
    emptySection: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        ...SHADOWS.card,
    },
    emptySectionText: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 8,
    },

    // ─── Health Records ───
    recordCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        ...SHADOWS.card,
    },
    recordIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: COLORS.primaryContainer + '30',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    recordContent: {
        flex: 1,
    },
    recordHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    recordTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.onSurface,
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    statusActive: {
        backgroundColor: '#e8f5e9',
    },
    statusResolved: {
        backgroundColor: COLORS.surfaceContainerHigh,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    statusTextActive: {
        color: '#2e7d32',
    },
    statusTextResolved: {
        color: COLORS.textMuted,
    },
    recordDescription: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
        marginBottom: 6,
    },
    recordMeta: {
        fontSize: 11,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // ─── Vaccination Table ───
    vaccinationTable: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 4,
        ...SHADOWS.card,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.outlineVariant,
    },
    tableHeaderText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.textMuted,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.outlineVariant + '50',
    },
    vaccineName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.onSurface,
    },
    vaccineLot: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    vaccineDate: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    verifiedFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    verifiedLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.textMuted,
        letterSpacing: 0.5,
    },
    downloadLink: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.primary,
    },

    // ─── FAB ───
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 100,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.button,
        elevation: 6,
    },
});
