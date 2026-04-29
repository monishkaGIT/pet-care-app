import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/theme';
import api from '../../api/axiosConfig';

export default function ChangePasswordScreen({ navigation }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            return Alert.alert('Missing Fields', 'All fields are required.');
        }
        if (newPassword.length < 6) {
            return Alert.alert('Weak Password', 'New password must be at least 6 characters.');
        }
        if (newPassword !== confirmPassword) {
            return Alert.alert('Mismatch', 'New passwords do not match.');
        }
        if (oldPassword === newPassword) {
            return Alert.alert('Same Password', 'New password must be different from old password.');
        }
        setLoading(true);
        try {
            await api.put('/password', { oldPassword, newPassword });
            Alert.alert('Success', 'Password changed successfully!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <TextInput style={styles.input} placeholder="Old Password" value={oldPassword} onChangeText={setOldPassword} secureTextEntry />
                <TextInput style={styles.input} placeholder="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
                <TextInput style={styles.input} placeholder="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

                <TouchableOpacity style={styles.btn} onPress={handleChangePassword} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Password</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: COLORS.lightGray },
    card: { backgroundColor: COLORS.surface, padding: 24, borderRadius: 12, elevation: 2 },
    input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16 },
    btn: { backgroundColor: COLORS.success, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    btnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 16 }
});
