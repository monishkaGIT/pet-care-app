import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import { fetchServiceStats } from '../../api/serviceApi';
import api from '../../api/axiosConfig';

export default function AdminDashboardScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [userCount, setUserCount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadStats();
        });
        return unsubscribe;
    }, [navigation]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [serviceStats, usersData] = await Promise.all([
                fetchServiceStats().catch(() => null),
                api.get('/').catch(() => null),
            ]);
            if (serviceStats) setStats(serviceStats);
            if (usersData?.data) setUserCount(usersData.data.length);
        } catch (error) {
            console.error('Failed to load stats:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Admin Panel</Text>
                <Text style={styles.roleBadge}>Welcome back, {user?.name}</Text>
            </View>

            {/* Stats row */}
            {loading ? (
                <ActivityIndicator size="small" color={COLORS.admin} style={{ marginBottom: 20 }} />
            ) : (
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{userCount ?? '—'}</Text>
                        <Text style={styles.statLabel}>Users</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats?.totalServices ?? '—'}</Text>
                        <Text style={styles.statLabel}>Services</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats?.activeServices ?? '—'}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                </View>
            )}

            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ManageUsers')}>
                <Text style={styles.cardTitle}>Manage Users</Text>
                <Text style={styles.cardDesc}>View registered users and remove accounts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.card, { borderLeftColor: COLORS.primary }]} onPress={() => navigation.navigate('ManageServices')}>
                <Text style={styles.cardTitle}>Manage Services</Text>
                <Text style={styles.cardDesc}>View, add, or edit pet care services and pricing</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.logoutBtn]} onPress={logout}>
                <Text style={styles.btnText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
    header: { marginBottom: 20, alignItems: 'center' },
    welcome: { fontSize: 32, fontWeight: 'bold', color: '#111827' },
    roleBadge: { marginTop: 8, color: COLORS.textSecondary, fontSize: 16 },

    /* Stats */
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 10 },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 1,
    },
    statValue: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
    statLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', marginTop: 4, letterSpacing: 0.5 },

    card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: COLORS.admin, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
    cardDesc: { color: COLORS.textMuted, marginTop: 6 },
    btn: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    logoutBtn: { backgroundColor: COLORS.danger },
    btnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 16 }
});
