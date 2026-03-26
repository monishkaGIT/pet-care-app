import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import api from '../../api/axiosConfig';

export default function ProfileScreen({ navigation }) {
    const { user, setUser, logout } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [profileImage, setProfileImage] = useState(user?.profileImage || null);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true
        });

        if (!result.canceled) {
            setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleUpdate = async () => {
        if (!name) return Alert.alert('Error', 'Name cannot be empty');
        setLoading(true);
        try {
            const { data } = await api.put('/profile', { name, phone, address, profileImage });
            setUser(data);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to permanently delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setDeleteLoading(true);
                        try {
                            await api.delete('/me');
                            Alert.alert("Deleted", "Your account has been deleted permanently.");
                            await logout();
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Could not delete account');
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
                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.image} />
                    ) : (
                        <Text style={styles.imagePlaceholderText}>+ Add Photo</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.label}>Email Address (Cannot be changed)</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={user?.email} editable={false} />

                <Text style={styles.label}>Full Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                <Text style={styles.label}>Address</Text>
                <TextInput style={styles.input} value={address} onChangeText={setAddress} />

                <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={loading || deleteLoading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Text style={styles.deleteBtnText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} disabled={loading || deleteLoading}>
                    {deleteLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteBtnText}>Delete Account</Text>}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: COLORS.background, justifyContent: 'center' },
    card: { backgroundColor: COLORS.surface, padding: 24, borderRadius: 12, elevation: 4 },
    imagePicker: {
        alignSelf: 'center',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.disabledBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden'
    },
    image: { width: '100%', height: '100%' },
    imagePlaceholderText: { color: COLORS.textMuted, fontSize: 12 },
    label: { fontSize: 14, color: COLORS.secondary, marginBottom: 6, fontWeight: 'bold' },
    input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
    disabledInput: { backgroundColor: COLORS.disabledBg, color: COLORS.textMuted, borderColor: COLORS.disabledBg },
    btn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center', ...SHADOWS.button, marginBottom: 15 },
    btnText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 16 },
    deleteBtn: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: COLORS.danger },
    logoutBtn: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 2, borderColor: COLORS.danger, marginBottom: 15 },
    deleteBtnText: { color: COLORS.danger, fontWeight: 'bold', fontSize: 16 }
});
