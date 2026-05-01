import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, StatusBar, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../../constants/theme';
import {
    createHealthRecord, updateHealthRecord,
    createVaccination, updateVaccination,
    addWeightEntry
} from '../../api/healthApi';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

const RECORD_TYPES = [
    { key: 'medical', label: 'Medical', icon: 'medkit' },
    { key: 'vaccination', label: 'Vaccination', icon: 'shield-checkmark' },
    { key: 'weight', label: 'Weight', icon: 'fitness' },
];

export default function NewHealthRecordScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { petId, editRecord } = route.params || {};

    const [recordType, setRecordType] = useState('medical');
    const [title, setTitle] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [notes, setNotes] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [vetName, setVetName] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');

    // Vaccination fields
    const [vaccineName, setVaccineName] = useState('');
    const [lotNumber, setLotNumber] = useState('');
    const [nextDueDate, setNextDueDate] = useState('');

    // Weight fields
    const [weight, setWeight] = useState('');
    const [weightUnit, setWeightUnit] = useState('kg');

    const [saving, setSaving] = useState(false);
    const [modalProps, showModal] = usePetCareModal();

    // Date Picker States
    const [visitDateObj, setVisitDateObj] = useState(new Date());
    const [nextDueDateObj, setNextDueDateObj] = useState(new Date());
    const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
    const [showNextDueDatePicker, setShowNextDueDatePicker] = useState(false);

    const formatDate = (d) => {
        if (!d) return '';
        const dateObj = new Date(d);
        if (isNaN(dateObj.getTime())) return '';
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${month}/${day}/${year}`;
    };

    useEffect(() => {
        if (editRecord) {
            setRecordType(editRecord.recordType || 'medical');
            setTitle(editRecord.title || '');
            if (editRecord.visitDate) {
                const d = new Date(editRecord.visitDate);
                setVisitDate(formatDate(d));
                setVisitDateObj(d);
            } else if (editRecord.administeredDate) {
                const d = new Date(editRecord.administeredDate);
                setVisitDate(formatDate(d));
                setVisitDateObj(d);
            } else if (editRecord.date) {
                const d = new Date(editRecord.date);
                setVisitDate(formatDate(d));
                setVisitDateObj(d);
            }
            
            setNotes(editRecord.notes || '');
            setClinicName(editRecord.clinicName || '');
            setVetName(editRecord.vetName || '');
            setDiagnosis(editRecord.diagnosis || '');
            if (Array.isArray(editRecord.treatment)) {
                setTreatment(editRecord.treatment.join('\n'));
            } else {
                setTreatment(editRecord.treatment || '');
            }

            setVaccineName(editRecord.vaccineName || '');
            setLotNumber(editRecord.lotNumber || '');
            if (editRecord.nextDueDate) {
                const d = new Date(editRecord.nextDueDate);
                setNextDueDate(formatDate(d));
                setNextDueDateObj(d);
            }

            setWeight(editRecord.weight ? String(editRecord.weight) : '');
            setWeightUnit(editRecord.unit || 'kg');
        } else {
            // New record - set default date
            const today = new Date();
            setVisitDate(formatDate(today));
            setVisitDateObj(today);
        }
    }, [editRecord]);

    const onChangeVisitDate = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowVisitDatePicker(false);
        }
        if (selectedDate) {
            setVisitDateObj(selectedDate);
            setVisitDate(formatDate(selectedDate));
        }
    };

    const onChangeNextDueDate = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowNextDueDatePicker(false);
        }
        if (selectedDate) {
            setNextDueDateObj(selectedDate);
            setNextDueDate(formatDate(selectedDate));
        }
    };

    const parseDate = (str) => {
        if (!str) return null;
        // Accept mm/dd/yyyy format
        const parts = str.split('/');
        if (parts.length === 3) {
            const [mm, dd, yyyy] = parts;
            return new Date(yyyy, mm - 1, dd);
        }
        return new Date(str);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            if (recordType === 'medical') {
                if (!title.trim()) {
                    showModal('warning', 'Missing Field', 'Please enter a title/diagnosis');
                    setSaving(false);
                    return;
                }
                const dataToSave = {
                    recordType: 'medical',
                    title: title.trim(),
                    visitDate: parseDate(visitDate) || new Date(),
                    clinicName: clinicName.trim(),
                    vetName: vetName.trim(),
                    diagnosis: diagnosis.trim(),
                    treatment: treatment.trim() ? treatment.split('\n').filter(t => t.trim()) : [],
                    notes: notes.trim(),
                };

                if (editRecord && editRecord._id) {
                    await updateHealthRecord(petId, editRecord._id, dataToSave);
                } else {
                    await createHealthRecord(petId, dataToSave);
                }
            } else if (recordType === 'vaccination') {
                if (!vaccineName.trim()) {
                    showModal('warning', 'Missing Field', 'Please enter the vaccine name');
                    setSaving(false);
                    return;
                }
                const dataToSave = {
                    vaccineName: vaccineName.trim(),
                    lotNumber: lotNumber.trim(),
                    administeredDate: parseDate(visitDate) || new Date(),
                    nextDueDate: parseDate(nextDueDate) || null,
                    clinicName: clinicName.trim(),
                    notes: notes.trim(),
                };

                if (editRecord && editRecord._id) {
                    await updateVaccination(petId, editRecord._id, dataToSave);
                } else {
                    await createVaccination(petId, dataToSave);
                }
            } else if (recordType === 'weight') {
                if (!weight.trim() || isNaN(parseFloat(weight))) {
                    showModal('warning', 'Invalid Weight', 'Please enter a valid weight');
                    setSaving(false);
                    return;
                }
                await addWeightEntry(petId, {
                    weight: parseFloat(weight),
                    unit: weightUnit,
                    date: parseDate(visitDate) || new Date(),
                    notes: notes.trim(),
                });
            }

            showModal('success', 'Saved!', 'Record saved successfully!', [
                { text: 'OK', style: 'primary', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            console.error('Save error:', err);
            showModal('error', 'Error', err.response?.data?.message || 'Failed to save record');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <PetCareModal {...modalProps} />
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Record</Text>
                <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={18} color="#fff" />
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── Vet Logbook Card ─── */}
                <View style={styles.logbookCard}>
                    <View style={styles.logbookHeader}>
                        <View style={styles.logbookAccent} />
                        <Text style={styles.logbookTitle}>Vet Logbook Entry</Text>
                    </View>

                    {/* Record Type Chips */}
                    <Text style={styles.fieldLabel}>Record Type</Text>
                    <View style={styles.chipGroup}>
                        {RECORD_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.key}
                                style={[
                                    styles.chip,
                                    recordType === type.key && styles.chipActive
                                ]}
                                onPress={() => setRecordType(type.key)}
                            >
                                <Ionicons
                                    name={type.icon}
                                    size={16}
                                    color={recordType === type.key ? '#fff' : COLORS.primary}
                                />
                                <Text style={[
                                    styles.chipText,
                                    recordType === type.key && styles.chipTextActive
                                ]}>{type.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ─── Medical Fields ─── */}
                    {recordType === 'medical' && (
                        <>
                            <Text style={styles.fieldLabel}>Title / Diagnosis</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Annual Checkup"
                                placeholderTextColor={COLORS.textPlaceholder}
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Text style={styles.fieldLabel}>Date of Visit</Text>
                            <TouchableOpacity style={styles.dateInputContainer} onPress={() => setShowVisitDatePicker(true)}>
                                <Text style={[styles.dateInputText, !visitDate && { color: COLORS.textPlaceholder }]}>
                                    {visitDate || 'mm/dd/yyyy'}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color={COLORS.textMuted} style={styles.dateIcon} />
                            </TouchableOpacity>

                            {showVisitDatePicker && (
                                <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : null}>
                                    <DateTimePicker
                                        value={visitDateObj}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onChangeVisitDate}
                                    />
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity style={styles.iosDoneButton} onPress={() => setShowVisitDatePicker(false)}>
                                            <Text style={styles.iosDoneButtonText}>Done</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            <Text style={styles.fieldLabel}>Clinic Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="St. Francis Veterinary Clinic"
                                placeholderTextColor={COLORS.textPlaceholder}
                                value={clinicName}
                                onChangeText={setClinicName}
                            />

                            <Text style={styles.fieldLabel}>Veterinarian</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Dr. Sarah Jenkins"
                                placeholderTextColor={COLORS.textPlaceholder}
                                value={vetName}
                                onChangeText={setVetName}
                            />

                            <Text style={styles.fieldLabel}>Diagnosis</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter diagnosis details"
                                placeholderTextColor={COLORS.textPlaceholder}
                                value={diagnosis}
                                onChangeText={setDiagnosis}
                            />

                            <Text style={styles.fieldLabel}>Treatment Plan</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter each treatment on a new line"
                                placeholderTextColor={COLORS.textPlaceholder}
                                value={treatment}
                                onChangeText={setTreatment}
                                multiline
                                numberOfLines={3}
                            />

                            <Text style={styles.fieldLabel}>Notes / Treatment Plan</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe the symptoms, prescribed medications, or follow-up instructions..."
                                placeholderTextColor={COLORS.textPlaceholder}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </>
                    )}

                    {/* ─── Vaccination Fields ─── */}
                    {recordType === 'vaccination' && (
                        <>
                            <Text style={styles.fieldLabel}>Vaccine Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Rabies (3-Year)"
                                placeholderTextColor={COLORS.textPlaceholder}
                                value={vaccineName}
                                onChangeText={setVaccineName}
                            />

                            <Text style={styles.fieldLabel}>Lot Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Lot: #4492-AX"
                                placeholderTextColor={COLORS.textPlaceholder}
                                value={lotNumber}
                                onChangeText={setLotNumber}
                            />

                            <Text style={styles.fieldLabel}>Date Administered</Text>
                            <TouchableOpacity style={styles.dateInputContainer} onPress={() => setShowVisitDatePicker(true)}>
                                <Text style={[styles.dateInputText, !visitDate && { color: COLORS.textPlaceholder }]}>
                                    {visitDate || 'mm/dd/yyyy'}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color={COLORS.textMuted} style={styles.dateIcon} />
                            </TouchableOpacity>

                            {showVisitDatePicker && (
                                <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : null}>
                                    <DateTimePicker
                                        value={visitDateObj}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onChangeVisitDate}
                                    />
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity style={styles.iosDoneButton} onPress={() => setShowVisitDatePicker(false)}>
                                            <Text style={styles.iosDoneButtonText}>Done</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            <Text style={styles.fieldLabel}>Next Due Date</Text>
                            <TouchableOpacity style={styles.dateInputContainer} onPress={() => setShowNextDueDatePicker(true)}>
                                <Text style={[styles.dateInputText, !nextDueDate && { color: COLORS.textPlaceholder }]}>
                                    {nextDueDate || 'mm/dd/yyyy'}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color={COLORS.textMuted} style={styles.dateIcon} />
                            </TouchableOpacity>

                            {showNextDueDatePicker && (
                                <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : null}>
                                    <DateTimePicker
                                        value={nextDueDateObj}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onChangeNextDueDate}
                                    />
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity style={styles.iosDoneButton} onPress={() => setShowNextDueDatePicker(false)}>
                                            <Text style={styles.iosDoneButtonText}>Done</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            <Text style={styles.fieldLabel}>Clinic Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Paws & Claws Clinic"
                                placeholderTextColor={COLORS.textPlaceholder}
                                value={clinicName}
                                onChangeText={setClinicName}
                            />

                            <Text style={styles.fieldLabel}>Notes</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Additional notes..."
                                placeholderTextColor={COLORS.textPlaceholder}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </>
                    )}

                    {/* ─── Weight Fields ─── */}
                    {recordType === 'weight' && (
                        <>
                            <Text style={styles.fieldLabel}>Weight</Text>
                            <View style={styles.weightRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="12.4"
                                    placeholderTextColor={COLORS.textPlaceholder}
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                />
                                <View style={styles.unitToggle}>
                                    <TouchableOpacity
                                        style={[styles.unitBtn, weightUnit === 'kg' && styles.unitBtnActive]}
                                        onPress={() => setWeightUnit('kg')}
                                    >
                                        <Text style={[styles.unitText, weightUnit === 'kg' && styles.unitTextActive]}>kg</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.unitBtn, weightUnit === 'lbs' && styles.unitBtnActive]}
                                        onPress={() => setWeightUnit('lbs')}
                                    >
                                        <Text style={[styles.unitText, weightUnit === 'lbs' && styles.unitTextActive]}>lbs</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.fieldLabel}>Date of Measurement</Text>
                            <TouchableOpacity style={styles.dateInputContainer} onPress={() => setShowVisitDatePicker(true)}>
                                <Text style={[styles.dateInputText, !visitDate && { color: COLORS.textPlaceholder }]}>
                                    {visitDate || 'mm/dd/yyyy'}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color={COLORS.textMuted} style={styles.dateIcon} />
                            </TouchableOpacity>

                            {showVisitDatePicker && (
                                <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : null}>
                                    <DateTimePicker
                                        value={visitDateObj}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onChangeVisitDate}
                                    />
                                    {Platform.OS === 'ios' && (
                                        <TouchableOpacity style={styles.iosDoneButton} onPress={() => setShowVisitDatePicker(false)}>
                                            <Text style={styles.iosDoneButtonText}>Done</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            <Text style={styles.fieldLabel}>Notes</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Any observations..."
                                placeholderTextColor={COLORS.textPlaceholder}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </>
                    )}
                </View>

                {/* ─── Buttons ─── */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>
                        {saving ? 'Saving...' : 'Save Entry'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                {/* ─── Info Footer ─── */}
                <View style={styles.infoFooter}>
                    <Ionicons name="information-circle" size={18} color={COLORS.primary} />
                    <Text style={styles.infoText}>
                        This record will be automatically synced with your shared family profile and alerted for future follow-up dates.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        backgroundColor: COLORS.primary + 'aa',
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ─── Scroll ───
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },

    // ─── Logbook Card ───
    logbookCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        ...SHADOWS.card,
    },
    logbookHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    logbookAccent: {
        width: 4,
        height: 28,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
        marginRight: 12,
    },
    logbookTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.onSurface,
    },

    // ─── Fields ───
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: COLORS.onSurface,
        borderWidth: 1,
        borderColor: COLORS.outlineVariant,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.outlineVariant,
    },
    dateInputText: {
        fontSize: 15,
        color: COLORS.onSurface,
        flex: 1,
    },
    dateIcon: {
        marginLeft: 8,
    },

    // ─── Chips ───
    chipGroup: {
        flexDirection: 'column',
        gap: 10,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceContainerLow,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.outlineVariant,
        alignSelf: 'flex-start',
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.onSurface,
    },
    chipTextActive: {
        color: '#fff',
    },

    // ─── Weight ───
    weightRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    unitToggle: {
        flexDirection: 'row',
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.outlineVariant,
    },
    unitBtn: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    unitBtnActive: {
        backgroundColor: COLORS.primary,
    },
    unitText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    unitTextActive: {
        color: '#fff',
    },

    // ─── Save / Cancel Buttons ───
    saveButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 30,
        paddingVertical: 16,
        marginTop: 24,
        gap: 8,
        ...SHADOWS.button,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    cancelButton: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        paddingVertical: 14,
        marginTop: 12,
        borderWidth: 1.5,
        borderColor: COLORS.outlineVariant,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },

    // ─── Info Footer ───
    infoFooter: {
        flexDirection: 'row',
        backgroundColor: COLORS.primaryContainer + '30',
        borderRadius: 12,
        padding: 14,
        marginTop: 20,
        gap: 10,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 19,
    },
    iosPickerContainer: {
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 14,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.outlineVariant,
    },
    iosDoneButton: {
        backgroundColor: COLORS.primaryContainer,
        padding: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: COLORS.outlineVariant,
    },
    iosDoneButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
