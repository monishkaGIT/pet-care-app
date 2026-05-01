import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    StatusBar,
    ActivityIndicator,
    Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import api from '../../api/axiosConfig';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

// ── Components ─────────────────────────────────────────────────────

function InfoRow({ icon, label, value }) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <MaterialIcons name={icon} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || '—'}</Text>
            </View>
        </View>
    );
}

// ── Screen ─────────────────────────────────────────────────────────

export default function UserDetailsScreen({ route, navigation }) {
    const { user } = route.params;
    const [deleting, setDeleting] = useState(false);
    const [modalProps, showModal] = usePetCareModal();

    const isAdmin = user.role === 'admin';

    const initials = user.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const joinDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
        })
        : 'Unknown';

    const joinTime = user.createdAt
        ? new Date(user.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit',
        })
        : '';

    const handleDelete = () => {
        if (isAdmin) {
            showModal('warning', 'Cannot Delete', 'Admin accounts cannot be removed from this panel.');
            return;
        }

        showModal('warning', 'Remove User', `Are you sure you want to permanently delete "${user.name}"?\n\nThis action cannot be undone.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setDeleting(true);
                        await api.delete(`/${user._id}`);
                        showModal('success', 'Success', 'User has been removed.', [
                            { text: 'OK', style: 'primary', onPress: () => navigation.goBack() },
                        ]);
                    } catch (err) {
                        setDeleting(false);
                        showModal('error', 'Error', err.response?.data?.message || 'Failed to delete user');
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <PetCareModal {...modalProps} />
            {/* ── Top App Bar ── */}
            <View style={[styles.topBar, SHADOWS.editorial]}>
                <View style={styles.topBarLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.topBarTitle}>User Details</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* ── Profile Header ── */}
                <View style={[styles.profileCard, SHADOWS.editorial]}>
                    <View style={[styles.profileAvatar, isAdmin && styles.profileAvatarAdmin, user.profileImage && { backgroundColor: 'transparent' }]}>
                        {user.profileImage ? (
                            <Image source={{ uri: user.profileImage }} style={{ width: '100%', height: '100%', borderRadius: 40 }} />
                        ) : (
                            <Text style={[styles.profileInitials, isAdmin && styles.profileInitialsAdmin]}>{initials}</Text>
                        )}
                    </View>
                    <Text style={styles.profileName}>{user.name}</Text>
                    <Text style={styles.profileEmail}>{user.email}</Text>
                    <View style={[styles.roleBadge, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser]}>
                        <MaterialIcons
                            name={isAdmin ? 'shield' : 'person'}
                            size={14}
                            color={isAdmin ? '#fff' : COLORS.primary}
                        />
                        <Text style={[styles.roleBadgeText, isAdmin ? styles.roleBadgeTextAdmin : styles.roleBadgeTextUser]}>
                            {isAdmin ? 'Administrator' : 'Regular User'}
                        </Text>
                    </View>
                </View>

                {/* ── Details Section ── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                </View>

                <View style={[styles.detailsCard, SHADOWS.card]}>
                    <InfoRow icon="person" label="Full Name" value={user.name} />
                    <View style={styles.divider} />
                    <InfoRow icon="email" label="Email Address" value={user.email} />
                    <View style={styles.divider} />
                    <InfoRow icon="phone" label="Phone Number" value={user.phone} />
                    <View style={styles.divider} />
                    <InfoRow icon="location-on" label="Address" value={user.address} />
                    <View style={styles.divider} />
                    <InfoRow icon="badge" label="Role" value={user.role === 'admin' ? 'Administrator' : 'User'} />
                    <View style={styles.divider} />
                    <InfoRow icon="calendar-today" label="Joined" value={`${joinDate}${joinTime ? ' at ' + joinTime : ''}`} />
                    {user.updatedAt && (
                        <>
                            <View style={styles.divider} />
                            <InfoRow
                                icon="update"
                                label="Last Updated"
                                value={new Date(user.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                })}
                            />
                        </>
                    )}
                </View>

                {/* ── Delete Button ── */}
                {!isAdmin && (
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        activeOpacity={0.85}
                        onPress={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <MaterialIcons name="delete-forever" size={20} color="#fff" />
                                <Text style={styles.deleteBtnText}>REMOVE USER</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {isAdmin && (
                    <View style={styles.adminNotice}>
                        <MaterialIcons name="info-outline" size={18} color={COLORS.admin} />
                        <Text style={styles.adminNoticeText}>
                            Admin accounts cannot be removed from this panel.
                        </Text>
                    </View>
                )}
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

    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    /* Profile card */
    profileCard: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    profileAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    profileAvatarAdmin: {
        backgroundColor: '#ede9fe',
    },
    profileInitials: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.primary,
    },
    profileInitialsAdmin: {
        color: COLORS.admin,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.secondary,
        textAlign: 'center',
    },
    profileEmail: {
        fontSize: 14,
        color: COLORS.onSurfaceVariant,
        marginTop: 4,
        textAlign: 'center',
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 14,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 999,
    },
    roleBadgeAdmin: {
        backgroundColor: COLORS.admin,
    },
    roleBadgeUser: {
        backgroundColor: COLORS.primaryContainer,
    },
    roleBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    roleBadgeTextAdmin: {
        color: '#fff',
    },
    roleBadgeTextUser: {
        color: COLORS.primary,
    },

    /* Section header */
    sectionHeader: { marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.secondary, letterSpacing: -0.3 },

    /* Details card */
    detailsCard: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(162,210,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 11, fontWeight: '700', color: COLORS.outline, textTransform: 'uppercase', letterSpacing: 0.5 },
    infoValue: { fontSize: 15, fontWeight: '600', color: COLORS.secondary, marginTop: 2 },
    divider: { height: 1, backgroundColor: COLORS.surfaceContainerLow, marginHorizontal: 14 },

    /* Delete button */
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: COLORS.danger,
        paddingVertical: 16,
        borderRadius: 14,
        marginBottom: 12,
        ...SHADOWS.button,
    },
    deleteBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1.2 },

    /* Admin notice */
    adminNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#f5f3ff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    adminNoticeText: { flex: 1, fontSize: 13, color: COLORS.admin, fontWeight: '600', lineHeight: 18 },
});
