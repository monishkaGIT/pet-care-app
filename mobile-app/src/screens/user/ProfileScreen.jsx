import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
    const [activeTab, setActiveTab] = useState('grid');

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
        Alert.alert("Delete Account", "Are you sure you want to permanently delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive",
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
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={22} color="#30628a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>User Profile</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerBtn}>
                        <MaterialIcons name="add-circle" size={22} color="#30628a" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerBtn}>
                        <MaterialIcons name="settings" size={22} color="#30628a" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    {/* Avatar */}
                    <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage} activeOpacity={0.85}>
                        <View style={styles.avatarRing}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatarImg} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <MaterialIcons name="person" size={52} color="#a2d2ff" />
                                </View>
                            )}
                        </View>
                        <View style={styles.editBadge}>
                            <MaterialIcons name="edit" size={14} color="#ffffff" />
                        </View>
                    </TouchableOpacity>

                    {/* Profile Info */}
                    <View style={styles.profileInfo}>
                        <View style={styles.profileNameRow}>
                            <Text style={styles.profileUsername}>{user?.name || 'User'}</Text>
                            <TouchableOpacity style={styles.editProfileBtn} onPress={handleUpdate} disabled={loading}>
                                {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.editProfileBtnText}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.profileBio}>{user?.email || 'Proud pet parent 🐾'}</Text>

                    </View>
                </View>

                {/* Edit Fields */}
                <View style={styles.editSection}>
                    <Text style={styles.editSectionTitle}>Edit Profile</Text>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#72787f" />
                    <Text style={styles.fieldLabel}>Email (Cannot be changed)</Text>
                    <TextInput style={[styles.input, styles.disabledInput]} value={user?.email} editable={false} />
                    <Text style={styles.fieldLabel}>Phone Number</Text>
                    <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone" placeholderTextColor="#72787f" />
                    <Text style={styles.fieldLabel}>Address</Text>
                    <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor="#72787f" />
                </View>

                {/* Action buttons */}
                <View style={styles.actionSection}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <MaterialIcons name="logout" size={18} color="#ba1a1a" />
                        <Text style={styles.dangerBtnText}>Logout</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} disabled={deleteLoading}>
                        {deleteLoading ? <ActivityIndicator color="#ba1a1a" /> : (
                            <>
                                <MaterialIcons name="delete-forever" size={18} color="#ba1a1a" />
                                <Text style={styles.dangerBtnText}>Delete Account</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    header: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 10, paddingBottom: 18,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: 'rgba(111,78,55,0.08)', shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 1, elevation: 4,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#30628a', fontStyle: 'italic' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    profileHeader: { flexDirection: 'row', gap: 20, paddingTop: 28, paddingBottom: 20 },
    avatarWrapper: { position: 'relative' },
    avatarRing: {
        width: 110, height: 110, borderRadius: 55,
        borderWidth: 4, borderColor: '#a2d2ff',
        padding: 3,
        shadowColor: '#30628a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4,
        overflow: 'hidden', backgroundColor: '#faf3e0',
    },
    avatarImg: { width: '100%', height: '100%', borderRadius: 55 },
    avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    editBadge: {
        position: 'absolute', bottom: 4, right: 4,
        backgroundColor: '#f59e0b', width: 28, height: 28, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#fff9ec',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
    },
    profileInfo: { flex: 1, paddingTop: 4 },
    profileNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
    profileUsername: { fontSize: 22, fontWeight: '800', color: '#79573f', flex: 1 },
    editProfileBtn: {
        backgroundColor: '#f59e0b', paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
    },
    editProfileBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
    profileBio: { fontSize: 13, color: '#41474e', lineHeight: 18, marginBottom: 12 },
    statsRow: { flexDirection: 'row', gap: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e9e2d0' },
    statItem: { alignItems: 'flex-start' },
    statValue: { fontSize: 18, fontWeight: '800', color: '#79573f' },
    statLabel: { fontSize: 9, color: 'rgba(65,71,78,0.7)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 'bold' },
    editSection: { backgroundColor: '#faf3e0', borderRadius: 16, padding: 20, marginBottom: 20 },
    editSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#79573f', marginBottom: 16 },
    fieldLabel: { fontSize: 13, color: '#79573f', fontWeight: '600', marginBottom: 6 },
    input: {
        backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#D9CFBC',
        borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 15, color: '#1e1c10', marginBottom: 14,
    },
    disabledInput: { backgroundColor: '#f4eedb', color: '#72787f' },
    tabBar: {
        flexDirection: 'row', borderBottomWidth: 1, borderColor: '#efe8d5',
        marginBottom: 12,
    },
    tabItem: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 14,
        borderBottomWidth: 2, borderBottomColor: 'transparent',
    },
    tabItemActive: { borderBottomColor: '#f59e0b' },
    tabLabel: { fontSize: 10, fontWeight: 'bold', color: 'rgba(65,71,78,0.5)', letterSpacing: 1, textTransform: 'uppercase' },
    tabLabelActive: { color: '#79573f' },
    postGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 24 },
    postCell: { width: '31.8%', aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    actionSection: { gap: 12 },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#fff9ec', paddingVertical: 16, borderRadius: 12,
        borderWidth: 2, borderColor: '#ba1a1a',
    },
    deleteBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#fff9ec', paddingVertical: 16, borderRadius: 12,
        borderWidth: 2, borderColor: '#ba1a1a',
    },
    dangerBtnText: { color: '#ba1a1a', fontWeight: 'bold', fontSize: 16 },
});
