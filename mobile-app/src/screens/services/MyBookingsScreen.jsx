import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchBookings, deleteBooking } from '../../api/bookingApi';
import { fetchUserPets } from '../../api/petApi';

const SERVICE_ICONS = {
    Grooming: 'content-cut',
    Boarding: 'home-heart',
    Walking: 'walk',
    Training: 'school-outline',
};

const STATUS_COLORS = {
    Pending: { bg: '#ffecd2', text: '#c7702e' },
    Confirmed: { bg: '#d4edda', text: '#28744e' },
    Completed: { bg: '#d1ecf1', text: '#0c5460' },
    Cancelled: { bg: '#f8d7da', text: '#721c24' },
};

export default function MyBookingsScreen() {
    const navigation = useNavigation();
    const [bookings, setBookings] = useState([]);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [bookingsData, petsData] = await Promise.all([
                fetchBookings(),
                fetchUserPets(),
            ]);
            setBookings(bookingsData);
            setPets(petsData);
        } catch (error) {
            console.error('Failed to load bookings', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const getPetName = (petId) => {
        const pet = pets.find(p => p._id === petId);
        return pet ? pet.name : 'My Pet';
    };

    const handleCancel = (booking) => {
        Alert.alert(
            'Cancel Booking',
            `Are you sure you want to cancel this ${booking.serviceType} booking?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteBooking(booking._id);
                            loadData();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel booking.');
                        }
                    },
                },
            ]
        );
    };

    const handleReschedule = (booking) => {
        navigation.navigate('BookAService', {
            serviceType: booking.serviceType,
            bookingId: booking._id,
        });
    };

    const upcomingBookings = bookings.filter(
        b => b.status === 'Pending' || b.status === 'Confirmed'
    );
    const completedBookings = bookings.filter(
        b => b.status === 'Completed'
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.secondary]}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="person-circle-outline" size={36} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.headerTitle}>My Bookings</Text>
                            <Text style={styles.headerSubtitle}>PetCare Services</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Upcoming Section */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Upcoming Trips</Text>
                        <Text style={styles.sectionCount}>
                            {upcomingBookings.length} Active
                        </Text>
                    </View>

                    {upcomingBookings.length === 0 && (
                        <View style={styles.emptyCard}>
                            <MaterialCommunityIcons name="calendar-blank-outline" size={40} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>No upcoming bookings</Text>
                            <TouchableOpacity
                                style={styles.emptyBtn}
                                onPress={() => navigation.navigate('MainTabs', { screen: 'Services' })}
                            >
                                <Text style={styles.emptyBtnText}>Browse Services</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {upcomingBookings.map((booking) => {
                        const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS.Pending;
                        return (
                            <View key={booking._id} style={styles.bookingCard}>
                                {/* Card Header */}
                                <View style={styles.cardHeaderRow}>
                                    <View style={styles.cardServiceRow}>
                                        <MaterialCommunityIcons
                                            name={SERVICE_ICONS[booking.serviceType] || 'paw'}
                                            size={20}
                                            color={COLORS.secondary}
                                        />
                                        <Text style={styles.cardServiceType}>
                                            {booking.serviceType.toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                            {booking.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                {/* Pet Name */}
                                <Text style={styles.cardPetName}>
                                    {getPetName(booking.petId)}
                                </Text>

                                {/* Date & Time Row */}
                                <View style={styles.dateTimeRow}>
                                    <View style={styles.dateTimeItem}>
                                        <Ionicons name="calendar-outline" size={18} color={COLORS.secondary} />
                                        <View style={{ marginLeft: 8 }}>
                                            <Text style={styles.dateTimeLabel}>DATE</Text>
                                            <Text style={styles.dateTimeValue}>{booking.bookingDate}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.dateTimeItem}>
                                        <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                                        <View style={{ marginLeft: 8 }}>
                                            <Text style={styles.dateTimeLabel}>TIME</Text>
                                            <Text style={styles.dateTimeValue}>{booking.bookingTime}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Notes (if any) */}
                                {booking.notes ? (
                                    <Text style={styles.cardNotes} numberOfLines={2}>
                                        📝 {booking.notes}
                                    </Text>
                                ) : null}

                                {/* Action Buttons — only for Pending bookings */}
                                {booking.status === 'Pending' && (
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={() => handleCancel(booking)}
                                    >
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.rescheduleBtn}
                                        onPress={() => handleReschedule(booking)}
                                    >
                                        <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                                    </TouchableOpacity>
                                </View>
                                )}
                            </View>
                        );
                    })}

                    {/* Completed Section */}
                    {completedBookings.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                                Recently Completed
                            </Text>
                            {completedBookings.map((booking) => (
                                <View key={booking._id} style={styles.completedCard}>
                                    <View style={styles.completedIconCircle}>
                                        <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.completedServiceType}>
                                            {booking.serviceType.toUpperCase()} • {getPetName(booking.petId).toUpperCase()}
                                        </Text>
                                        <Text style={styles.completedDate}>
                                            {booking.bookingDate} • Successfully Completed
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                                </View>
                            ))}
                        </>
                    )}
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
        paddingTop: 50,
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
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },

    // ── Content ──
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    // ── Section Header ──
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        fontStyle: 'italic',
    },
    sectionCount: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: '600',
    },

    // ── Empty State ──
    emptyCard: {
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        marginBottom: 16,
        ...SHADOWS.card,
    },
    emptyText: {
        fontSize: 15,
        color: COLORS.textMuted,
        marginTop: 10,
        marginBottom: 16,
    },
    emptyBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    emptyBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    // ── Booking Card ──
    bookingCard: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...SHADOWS.card,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardServiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardServiceType: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginLeft: 8,
        letterSpacing: 0.8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cardPetName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 14,
    },

    // ── Date & Time ──
    dateTimeRow: {
        flexDirection: 'row',
        marginBottom: 14,
    },
    dateTimeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 28,
    },
    dateTimeLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textMuted,
        letterSpacing: 0.5,
    },
    dateTimeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },

    // ── Notes ──
    cardNotes: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 14,
        fontStyle: 'italic',
    },

    // ── Action Buttons ──
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceContainerLow,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.outlineVariant,
    },
    cancelBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    rescheduleBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        ...SHADOWS.button,
    },
    rescheduleBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },

    // ── Completed Cards ──
    completedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
        ...SHADOWS.card,
    },
    completedIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    completedServiceType: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.textMuted,
        letterSpacing: 0.5,
    },
    completedDate: {
        fontSize: 13,
        color: COLORS.textPrimary,
        marginTop: 2,
    },

    // ── Notification Badge ──
    notifBadge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: '#dc2626',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
    },
});
