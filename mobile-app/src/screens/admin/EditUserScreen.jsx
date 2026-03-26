import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { COLORS } from '../../constants/theme';
import api from '../../api/axiosConfig';

export default function EditUserScreen({ route, navigation }) {
    const { user } = route.params; 
    const [name, setName] = useState(user.name);
    const [role, setRole] = useState(user.role);
    const [phone, setPhone] = useState(user.phone || '');
    const [address, setAddress] = useState(user.address || '');
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name || !role) return Alert.alert('Error', 'Name and Role required');
        const roleLower = role.toLowerCase().trim();
        if (roleLower !== 'user' && roleLower !== 'admin') {
            return Alert.alert('Error', 'Role must be exactly "user" or "admin"');
        }

        setLoading(true);
        try {
            await api.put(`/${user._id}`, { name, role: roleLower, phone, address });
            Alert.alert('Success', 'User updated successfully');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Delete User",
            "Are you sure you want to permanently delete this user? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        setDeleteLoading(true);
                        try {
                            await api.delete(`/${user._id}`);
                            Alert.alert('Deleted', 'User successfully removed');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Could not delete user');
                        } finally {
                            setDeleteLoading(false);
                        }
                    } 
                }
            ]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Edit User Details</Text>

                <Text style={styles.label}>Email ID (Immutable)</Text>
                <TextInput style={[styles.input, styles.disabled]} value={user.email} editable={false} />
                
                <Text style={styles.label}>Account Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                <Text style={styles.label}>Address</Text>
                <TextInput style={styles.input} value={address} onChangeText={setAddress} />
                
                <Text style={styles.label}>Role Privileges (admin or user)</Text>
                <TextInput style={styles.input} value={role} onChangeText={setRole} autoCapitalize="none" />
                
                <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={loading || deleteLoading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={loading || deleteLoading}>
                    {deleteLoading ? <ActivityIndicator color={COLORS.danger} /> : <Text style={styles.deleteBtnText}>Delete User</Text>}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: COLORS.lightGray, justifyContent: 'center' },
    card: { backgroundColor: COLORS.surface, padding: 24, borderRadius: 12, elevation: 4 },
    title: { fontSize: 22, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 14, color: COLORS.secondary, marginBottom: 6, fontWeight: 'bold' },
    input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
    disabled: { backgroundColor: COLORS.disabledBg, color: COLORS.disabledText, borderColor: COLORS.disabledBg },
    btn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
    btnText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 16 },
    deleteBtn: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: COLORS.danger },
    deleteBtnText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 16 }
});
