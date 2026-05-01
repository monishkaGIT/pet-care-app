import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/theme';
import api from '../../api/axiosConfig';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

export default function ChangePasswordScreen({ navigation }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalProps, showModal] = usePetCareModal();

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            return showModal('warning', 'Missing Fields', 'All fields are required.');
        }
        if (newPassword.length < 6) {
            return showModal('warning', 'Weak Password', 'New password must be at least 6 characters.');
        }
        if (newPassword !== confirmPassword) {
            return showModal('warning', 'Mismatch', 'New passwords do not match.');
        }
        if (oldPassword === newPassword) {
            return showModal('warning', 'Same Password', 'New password must be different from old password.');
        }
        setLoading(true);
        try {
            await api.put('/password', { oldPassword, newPassword });
            showModal('success', 'Success', 'Password changed successfully!', [
                { text: 'OK', style: 'primary', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            showModal('error', 'Error', error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <PetCareModal {...modalProps} />
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
