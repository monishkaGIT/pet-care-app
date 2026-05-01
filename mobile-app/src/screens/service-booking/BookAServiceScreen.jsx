import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, ActivityIndicator, Platform, StatusBar
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchUserPets } from '../../api/petApi';
import { createBooking, updateBooking, fetchBookings } from '../../api/bookingApi';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

export default function BookAServiceScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { serviceType = 'Grooming', bookingId = null } = route.params || {};

    const [pets, setPets] = useState([]);
    const [selectedPetId, setSelectedPetId] = useState('');
    const [selectedPetName, setSelectedPetName] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [modalProps, showModal] = usePetCareModal();

    const [dateObj, setDateObj] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const onChangeDate = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setDateObj(selectedDate);
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const year = selectedDate.getFullYear();
            setBookingDate(`${month}/${day}/${year}`);
        }
    };

    const onChangeTime = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (selectedDate) {
            setDateObj(selectedDate);
            let hours = selectedDate.getHours();
            const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            setBookingTime(`${String(hours).padStart(2, '0')}:${minutes} ${ampm}`);
        }
    };

    const isEditMode = !!bookingId;

    // Load pets and booking data (for edit mode)
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        setLoadingData(true);
        try {
            // Load user's pets
            const petsData = await fetchUserPets();
            setPets(petsData);
            if (petsData.length > 0 && !selectedPetId) {
                setSelectedPetId(petsData[0]._id);
                setSelectedPetName(petsData[0].name);
            }

            // If edit mode, load the booking data
            if (bookingId) {
                const allBookings = await fetchBookings();
                const booking = allBookings.find(b => b._id === bookingId);
                if (booking) {
                    setSelectedPetId(booking.petId || '');
                    setBookingDate(booking.bookingDate || '');
                    setBookingTime(booking.bookingTime || '');
                    setNotes(booking.notes || '');

                    // Initialize dateObj if date/time exist
                    if (booking.bookingDate) {
                        const [month, day, year] = booking.bookingDate.split('/');
                        if (month && day && year) {
                            const d = new Date(year, month - 1, day);
                            if (booking.bookingTime) {
                                // Add time to dateObj
                                const timeMatch = booking.bookingTime.match(/(\d+):(\d+)\s(AM|PM)/i);
                                if (timeMatch) {
                                    let hrs = parseInt(timeMatch[1], 10);
                                    const mins = parseInt(timeMatch[2], 10);
                                    const ap = timeMatch[3].toUpperCase();
                                    if (ap === 'PM' && hrs < 12) hrs += 12;
                                    if (ap === 'AM' && hrs === 12) hrs = 0;
                                    d.setHours(hrs, mins);
                                }
                            }
                            setDateObj(d);
                        }
                    }
                    // Try to find pet name
                    const pet = petsData.find(p => p._id === booking.petId);
                    if (pet) setSelectedPetName(pet.name);
                }
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleSelectPet = (pet) => {
        setSelectedPetId(pet._id);
        setSelectedPetName(pet.name);
    };

    const handleSubmit = async () => {
        if (!selectedPetId) {
            showModal('warning', 'No Pet Selected', 'Please select a pet for this booking.');
            return;
        }
        if (!bookingDate.trim()) {
            showModal('warning', 'Missing Date', 'Please enter a booking date.');
            return;
        }
        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
        if (!dateRegex.test(bookingDate.trim())) {
            showModal('warning', 'Invalid Date', 'Please enter date in mm/dd/yyyy format (e.g. 01/15/2026).');
            return;
        }
        if (!bookingTime.trim()) {
            showModal('warning', 'Missing Time', 'Please enter a booking time.');
            return;
        }

        setLoading(true);
        try {
            const data = {
                petId: selectedPetId,
                serviceType,
                bookingDate: bookingDate.trim(),
                bookingTime: bookingTime.trim(),
                notes: notes.trim(),
            };

            if (isEditMode) {
                await updateBooking(bookingId, data);
                showModal('success', 'Success', 'Booking updated successfully!', [
                    { text: 'OK', style: 'primary', onPress: () => navigation.navigate('MyBookings') }
                ]);
            } else {
                await createBooking(data);
                showModal('success', 'Success', 'Booking created successfully!', [
                    { text: 'OK', style: 'primary', onPress: () => navigation.navigate('MyBookings') }
                ]);
            }
        } catch (error) {
            console.error('Booking error', error);
            showModal('error', 'Error', 'Failed to save booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <View style={styles.loadingContainer}>
                <PetCareModal {...modalProps} />
                <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PetCareModal {...modalProps} />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="person-circle-outline" size={36} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.headerTitle}>
                                {isEditMode ? 'Edit Booking' : 'Book Service'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    {/* Service Type Badge */}
                    <View style={styles.serviceBadge}>
                        <MaterialCommunityIcons name="star-four-points" size={16} color={COLORS.primary} />
                        <Text style={styles.serviceBadgeText}>{serviceType}</Text>
                    </View>

                    {/* Pet Selection */}
                    <Text style={styles.label}>Select Pet</Text>
                    <View style={styles.petChipsRow}>
                        {pets.map(pet => (
                            <TouchableOpacity
                                key={pet._id}
                                style={[
                                    styles.petChip,
                                    selectedPetId === pet._id && styles.petChipSelected
                                ]}
                                onPress={() => handleSelectPet(pet)}
                            >
                                <MaterialCommunityIcons
                                    name="paw"
                                    size={16}
                                    color={selectedPetId === pet._id ? '#fff' : COLORS.secondary}
                                />
                                <Text style={[
                                    styles.petChipText,
                                    selectedPetId === pet._id && styles.petChipTextSelected
                                ]}>
                                    {pet.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.petChipAdd}
                            onPress={() => navigation.navigate('AddPet')}
                        >
                            <Ionicons name="add" size={16} color={COLORS.textMuted} />
                            <Text style={styles.petChipAddText}>New</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Date Input */}
                    <Text style={styles.label}>DATE</Text>
                    <TouchableOpacity style={styles.inputRow} onPress={() => setShowDatePicker(true)}>
                        <Text style={[styles.input, !bookingDate && { color: COLORS.textPlaceholder }]}>
                            {bookingDate || 'mm/dd/yyyy'}
                        </Text>
                        <Ionicons name="calendar-outline" size={22} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    {showDatePicker && (
                        <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : null}>
                            <DateTimePicker
                                value={dateObj}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onChangeDate}
                            />
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity style={styles.iosDoneButton} onPress={() => setShowDatePicker(false)}>
                                    <Text style={styles.iosDoneButtonText}>Done</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Time Input */}
                    <Text style={styles.label}>TIME</Text>
                    <TouchableOpacity style={styles.inputRow} onPress={() => setShowTimePicker(true)}>
                        <Text style={[styles.input, !bookingTime && { color: COLORS.textPlaceholder }]}>
                            {bookingTime || '--:-- --'}
                        </Text>
                        <Ionicons name="time-outline" size={22} color={COLORS.primary} />
                    </TouchableOpacity>

                    {showTimePicker && (
                        <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : null}>
                            <DateTimePicker
                                value={dateObj}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onChangeTime}
                            />
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity style={styles.iosDoneButton} onPress={() => setShowTimePicker(false)}>
                                    <Text style={styles.iosDoneButtonText}>Done</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Notes Input */}
                    <Text style={styles.label}>NOTES</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="Mention any special requirements or allergies..."
                        placeholderTextColor={COLORS.textPlaceholder}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={styles.bookBtn}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.bookBtnText}>
                                    {isEditMode ? 'Update Booking' : 'Book Now'}
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Premium Care Assured Banner */}
                <View style={styles.premiumBanner}>
                    <View style={styles.premiumIconCircle}>
                        <Ionicons name="checkmark-circle" size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.premiumTitle}>Premium Care Assured</Text>
                    <Text style={styles.premiumDesc}>
                        Our certified specialists provide a gentle, palm-fronted experience for your pets.
                    </Text>
                </View>

                <View style={{ height: 30 }} />
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

    // ── Header ──
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 50,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...SHADOWS.header,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        fontStyle: 'italic',
    },

    // ── Form ──
    formContainer: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    serviceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryContainer,
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 20,
    },
    serviceBadgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
        marginLeft: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
        letterSpacing: 0.5,
    },

    // ── Pet Chips ──
    petChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    petChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceContainerLow,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: COLORS.outlineVariant,
    },
    petChipSelected: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    petChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginLeft: 6,
    },
    petChipTextSelected: {
        color: '#fff',
    },
    petChipAdd: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: COLORS.outlineVariant,
        borderStyle: 'dashed',
    },
    petChipAddText: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginLeft: 4,
    },

    // ── Inputs ──
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.outlineVariant,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textPrimary,
    },
    notesInput: {
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: COLORS.textPrimary,
        minHeight: 100,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.outlineVariant,
    },

    // ── Book Button ──
    bookBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 28,
        marginBottom: 10,
        overflow: 'hidden',
        backgroundColor: COLORS.secondary,
        ...SHADOWS.button,
    },
    bookBtnText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
        marginRight: 10,
    },

    // ── Premium Banner ──
    premiumBanner: {
        backgroundColor: COLORS.primaryContainer,
        marginHorizontal: 24,
        marginTop: 24,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
    },
    premiumIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        ...SHADOWS.card,
    },
    premiumTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    premiumDesc: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: 'center',
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
