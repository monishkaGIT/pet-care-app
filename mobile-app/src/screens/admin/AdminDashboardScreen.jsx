import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

export default function AdminDashboardScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Admin Panel</Text>
                <Text style={styles.roleBadge}>Welcome back, {user?.name}</Text>
            </View>

            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('UserList')}>
                <Text style={styles.cardTitle}>Manage Users</Text>
                <Text style={styles.cardDesc}>View, edit, or delete registered user accounts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CreateUser')}>
                <Text style={styles.cardTitle}>Create New User</Text>
                <Text style={styles.cardDesc}>Manually register a user or assign admin privileges</Text>
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
    header: { marginBottom: 30, alignItems: 'center' },
    welcome: { fontSize: 32, fontWeight: 'bold', color: '#111827' },
    roleBadge: { marginTop: 8, color: COLORS.textSecondary, fontSize: 16 },
    card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: COLORS.admin, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
    cardDesc: { color: COLORS.textMuted, marginTop: 6 },
    btn: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    logoutBtn: { backgroundColor: COLORS.danger },
    btnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 16 }
});
