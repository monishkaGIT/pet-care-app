import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, RefreshControl, Platform, StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchAllBookings, updateBookingStatus } from '../../api/bookingApi';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

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

export default function AdminBookingsScreen() {
    const navigation = useNavigation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalProps, showModal] = usePetCareModal();

    const loadBookings = async () => {
        try {
            const data = await fetchAllBookings();
            setBookings(data);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadBookings();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadBookings();
    };

    const handleStatusChange = (booking, newStatus) => {
        const actionText = newStatus === 'Confirmed' ? 'Confirm' : newStatus === 'Completed' ? 'Complete' : 'Cancel';
        showModal('warning', `${actionText} Booking`, `Are you sure you want to ${actionText.toLowerCase()} this ${booking.serviceType} booking for ${booking.user?.name || 'user'}?`, [
            { text: 'No', style: 'cancel' },
            {
                text: `Yes, ${actionText}`,
                style: 'primary',
                onPress: async () => {
                    try {
                        await updateBookingStatus(booking._id, newStatus);
                        loadBookings();
                    } catch (error) {
                        showModal('error', 'Error', 'Failed to update booking status.');
                    }
                },
            },
        ]);
    };

    const pendingBookings = bookings.filter(b => b.status === 'Pending');
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
    const completedBookings = bookings.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PetCareModal {...modalProps} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.headerTitle}>Manage Bookings</Text>
                            <Text style={styles.headerSubtitle}>Review & confirm user bookings</Text>
                        </View>
                        <View style={styles.badgeWrap}>
                            <Text style={styles.badgeText}>{pendingBookings.length} Pending</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Pending Section */}
                    {pendingBookings.length > 0 && (
                        <>
                            <View style={styles.sectionHeaderRow}>
                                <View style={styles.sectionDot} />
                                <Text style={styles.sectionTitle}>Pending Approval</Text>
                                <Text style={styles.sectionCount}>{pendingBookings.length}</Text>
                            </View>
                            {pendingBookings.map((booking) => (
                                <BookingCard
                                    key={booking._id}
                                    booking={booking}
                                    onConfirm={() => handleStatusChange(booking, 'Confirmed')}
                                    onCancel={() => handleStatusChange(booking, 'Cancelled')}
                                    showActions
                                />
                            ))}
                        </>
                    )}

                    {/* Confirmed Section */}
                    {confirmedBookings.length > 0 && (
                        <>
                            <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
                                <View style={[styles.sectionDot, { backgroundColor: '#28744e' }]} />
                                <Text style={styles.sectionTitle}>Confirmed</Text>
                                <Text style={styles.sectionCount}>{confirmedBookings.length}</Text>
                            </View>
                            {confirmedBookings.map((booking) => (
                                <BookingCard
                                    key={booking._id}
                                    booking={booking}
                                    onComplete={() => handleStatusChange(booking, 'Completed')}
                                    onCancel={() => handleStatusChange(booking, 'Cancelled')}
                                    showConfirmedActions
                                />
                            ))}
                        </>
                    )}

                    {/* Completed / Cancelled */}
                    {completedBookings.length > 0 && (
                        <>
                            <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
                                <View style={[styles.sectionDot, { backgroundColor: '#0c5460' }]} />
                                <Text style={styles.sectionTitle}>History</Text>
                                <Text style={styles.sectionCount}>{completedBookings.length}</Text>
                            </View>
                            {completedBookings.map((booking) => {
                                const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS.Completed;
                                return (
                                    <View key={booking._id} style={styles.historyCard}>
                                        <View style={styles.historyLeft}>
                                            <Ionicons
                                                name={booking.status === 'Completed' ? 'checkmark-circle' : 'close-circle'}
                                                size={24}
                                                color={booking.status === 'Completed' ? '#28744e' : '#dc2626'}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.historyService}>{booking.serviceType}</Text>
                                            <Text style={styles.historyUser}>{booking.user?.name} • {booking.pet?.name}</Text>
                                            <Text style={styles.historyDate}>{booking.bookingDate}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                                {booking.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </>
                    )}

                    {/* Empty state */}
                    {bookings.length === 0 && (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="calendar-blank-outline" size={56} color={COLORS.textMuted} />
                            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                            <Text style={styles.emptySubtitle}>User bookings will appear here for approval</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

// ─── Booking Card Component ─────────────────────────────────────────────────

function BookingCard({ booking, onConfirm, onCancel, onComplete, showActions, showConfirmedActions }) {
    const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS.Pending;

    return (
        <View style={styles.bookingCard}>
            {/* Top Row */}
            <View style={styles.cardHeaderRow}>
                <View style={styles.cardServiceRow}>
                    <MaterialCommunityIcons
                        name={SERVICE_ICONS[booking.serviceType] || 'paw'}
                        size={20}
                        color={COLORS.primary}
                    />
                    <Text style={styles.cardServiceType}>
                        {booking.serviceType?.toUpperCase()}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {booking.status?.toUpperCase()}
                    </Text>
                </View>
            </View>

            {/* User Info */}
            <View style={styles.userInfoRow}>
                <Ionicons name="person-outline" size={16} color={COLORS.primary} />
                <Text style={styles.userInfoText}>{booking.user?.name || 'Unknown User'}</Text>
                <Text style={styles.userInfoEmail}>{booking.user?.email || ''}</Text>
            </View>

            {/* Pet */}
            <View style={styles.userInfoRow}>
                <MaterialCommunityIcons name="paw" size={16} color={COLORS.secondary} />
                <Text style={styles.userInfoText}>{booking.pet?.name || 'Unknown Pet'}</Text>
                {booking.pet?.breed ? (
                    <Text style={styles.userInfoEmail}>({booking.pet.breed})</Text>
                ) : null}
            </View>

            {/* Date & Time */}
            <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeItem}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                    <View style={{ marginLeft: 6 }}>
                        <Text style={styles.dtLabel}>DATE</Text>
                        <Text style={styles.dtValue}>{booking.bookingDate}</Text>
                    </View>
                </View>
                <View style={styles.dateTimeItem}>
                    <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                    <View style={{ marginLeft: 6 }}>
                        <Text style={styles.dtLabel}>TIME</Text>
                        <Text style={styles.dtValue}>{booking.bookingTime}</Text>
                    </View>
                </View>
            </View>

            {/* Notes */}
            {booking.notes ? (
                <Text style={styles.cardNotes} numberOfLines={2}>📝 {booking.notes}</Text>
            ) : null}

            {/* Action buttons — Pending */}
            {showActions && (
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                        <Ionicons name="close-circle-outline" size={18} color="#dc2626" />
                        <Text style={styles.cancelBtnText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <Text style={styles.confirmBtnText}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Action buttons — Confirmed */}
            {showConfirmedActions && (
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                        <Ionicons name="close-circle-outline" size={18} color="#dc2626" />
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#059669' }]} onPress={onComplete}>
                        <Ionicons name="checkmark-done" size={18} color="#fff" />
                        <Text style={styles.confirmBtnText}>Complete</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

    /* Header */
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 50,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...SHADOWS.header,
    },
    headerTopRow: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
    badgeWrap: {
        backgroundColor: '#f59e0b',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 14,
    },
    badgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },

    content: { paddingHorizontal: 20, paddingTop: 20 },

    /* Section */
    sectionHeaderRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8,
    },
    sectionDot: {
        width: 10, height: 10, borderRadius: 5, backgroundColor: '#c7702e',
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, flex: 1 },
    sectionCount: {
        fontSize: 13, fontWeight: '700', color: COLORS.textMuted,
        backgroundColor: COLORS.surfaceContainerLow,
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
    },

    /* Booking Card */
    bookingCard: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        ...SHADOWS.card,
    },
    cardHeaderRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
    },
    cardServiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardServiceType: {
        fontSize: 12, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 0.8,
    },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

    /* User/Pet Info */
    userInfoRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6,
    },
    userInfoText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
    userInfoEmail: { fontSize: 12, color: COLORS.textMuted },

    /* Date/Time */
    dateTimeRow: { flexDirection: 'row', marginTop: 8, marginBottom: 10, gap: 24 },
    dateTimeItem: { flexDirection: 'row', alignItems: 'center' },
    dtLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5 },
    dtValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },

    /* Notes */
    cardNotes: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic', marginBottom: 10 },

    /* Actions */
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
    cancelBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 11, borderRadius: 16,
        backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#fecaca', gap: 6,
    },
    cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
    confirmBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 11, borderRadius: 16,
        backgroundColor: COLORS.primary, gap: 6,
        ...SHADOWS.button,
    },
    confirmBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

    /* History */
    historyCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 14, padding: 14, marginBottom: 10,
        ...SHADOWS.card,
    },
    historyLeft: { marginRight: 12 },
    historyService: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    historyUser: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    historyDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

    /* Empty */
    emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' },
});
