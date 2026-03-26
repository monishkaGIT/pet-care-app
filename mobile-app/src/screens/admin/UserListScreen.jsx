import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/theme';
import api from '../../api/axiosConfig';

export default function UserListScreen({ navigation }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/');
            setUsers(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchUsers();
        });
        return unsubscribe;
    }, [navigation]);

    const handleDelete = (id) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to remove this user forever?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Delete', 
                style: 'destructive', 
                onPress: async () => {
                    try {
                        await api.delete(`/${id}`);
                        setUsers(users.filter(u => u._id !== id));
                        Alert.alert('Deleted', 'User successfully removed');
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete user');
                    }
                } 
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={[styles.role, item.role === 'admin' && styles.adminRole]}>Role: {item.role}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditUser', { user: item })}>
                    <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                    <Text style={styles.btnText}>Del</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.admin} /></View>;

    return (
        <View style={styles.container}>
            <FlatList 
                data={users}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: COLORS.lightGray },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    userCard: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 1 },
    name: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
    email: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
    role: { fontSize: 12, color: COLORS.success, fontWeight: 'bold', marginTop: 6, textTransform: 'uppercase' },
    adminRole: { color: COLORS.admin },
    actions: { flexDirection: 'row', marginLeft: 16 },
    editBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginRight: 8 },
    deleteBtn: { backgroundColor: COLORS.danger, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    btnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 14 }
});
