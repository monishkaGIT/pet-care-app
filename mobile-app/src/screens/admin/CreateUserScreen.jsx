import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/theme';
import api from '../../api/axiosConfig';

export default function CreateUserScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); 
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !email || !password) return Alert.alert('Error', 'All fields required');
        const roleLower = role.toLowerCase().trim();
        if (roleLower !== 'user' && roleLower !== 'admin') {
            return Alert.alert('Error', 'Role must be exactly "user" or "admin"');
        }

        setLoading(true);
        try {
            await api.post('/', { name, email, password, role: roleLower });
            Alert.alert('Success', 'User created successfully');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Creation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} placeholder="e.g. John Doe" value={name} onChangeText={setName} />
                
                <Text style={styles.label}>Email Address</Text>
                <TextInput style={styles.input} placeholder="john@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                
                <Text style={styles.label}>Temporary Password</Text>
                <TextInput style={styles.input} placeholder="********" value={password} onChangeText={setPassword} secureTextEntry />
                
                <Text style={styles.label}>Account Role (admin or user)</Text>
                <TextInput style={styles.input} placeholder="user" value={role} onChangeText={setRole} autoCapitalize="none" />
                
                <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create User Account</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: COLORS.lightGray },
    card: { backgroundColor: COLORS.surface, padding: 24, borderRadius: 12, elevation: 2 },
    label: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6, fontWeight: 'bold' },
    input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
    btn: { backgroundColor: COLORS.admin, padding: 16, borderRadius: 8, alignItems: 'center' },
    btnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 16 }
});
