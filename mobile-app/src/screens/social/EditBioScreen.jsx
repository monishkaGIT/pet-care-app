import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Image, ScrollView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

export default function EditBioScreen({ navigation }) {
    const { user, setUser } = useContext(AuthContext);
    const [bio, setBio] = useState(user?.bio || '');
    const [loading, setLoading] = useState(false);
    const [modalProps, showModal] = usePetCareModal();

    const handleSave = async () => {
        if (bio.trim().length > 160) {
            showModal('warning', 'Bio Too Long', 'Bio must be under 160 characters.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.put('/profile', { bio: bio.trim() });
            setUser(data);
            showModal('success', 'Saved', 'Your bio has been updated.', [
                { text: 'OK', style: 'primary', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            showModal('error', 'Error', error.response?.data?.message || 'Could not update bio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <PetCareModal {...modalProps} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <MaterialIcons name="close" size={26} color="#30628a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Bio</Text>
                <TouchableOpacity
                    style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                    activeOpacity={0.85}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.saveBtnText}>SAVE</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.heroCard}>
                    <View style={styles.avatarRing}>
                        {user?.profileImage ? (
                            <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <MaterialIcons name="person" size={52} color="#a2d2ff" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{user?.name || 'Pet Parent'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                <View style={styles.editorCard}>
                    <Text style={styles.label}>Your Bio</Text>
                    <TextInput
                        style={styles.input}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Tell people a little about you and your pets"
                        placeholderTextColor="#72787f"
                        multiline
                        maxLength={160}
                        textAlignVertical="top"
                    />
                    <Text style={styles.helperText}>{bio.trim().length}/160</Text>
                </View>

                <View style={styles.tipCard}>
                    <MaterialIcons name="info-outline" size={18} color="#30628a" />
                    <Text style={styles.tipText}>This updates the same profile data used by My Profile and My Posts.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    header: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 10,
        paddingBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: 'rgba(111,78,55,0.08)',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        shadowOpacity: 1,
        elevation: 4,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#30628a' },
    saveBtn: {
        backgroundColor: '#f59e0b',
        paddingVertical: 9,
        paddingHorizontal: 22,
        borderRadius: 20,
        minWidth: 64,
        alignItems: 'center',
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },
    heroCard: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 12,
    },
    avatarRing: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 4,
        borderColor: '#a2d2ff',
        padding: 3,
        overflow: 'hidden',
        backgroundColor: '#faf3e0',
    },
    avatarImg: { width: '100%', height: '100%', borderRadius: 48 },
    avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
    name: { marginTop: 12, fontSize: 20, fontWeight: '900', color: '#79573f' },
    email: { marginTop: 4, fontSize: 12, color: '#72787f' },
    editorCard: {
        backgroundColor: '#faf3e0',
        borderRadius: 28,
        marginHorizontal: 16,
        marginTop: 12,
        padding: 20,
        shadowColor: 'rgba(111,78,55,0.08)',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        shadowOpacity: 1,
        elevation: 2,
    },
    label: { fontSize: 13, fontWeight: '800', color: '#79573f', marginBottom: 10 },
    input: {
        minHeight: 140,
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#D9CFBC',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 14,
        fontSize: 15,
        color: '#1e1c10',
        lineHeight: 22,
    },
    helperText: { marginTop: 10, fontSize: 12, color: '#72787f', textAlign: 'right' },
    tipCard: {
        marginHorizontal: 16,
        marginTop: 14,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#efe8d5',
    },
    tipText: { flex: 1, fontSize: 13, color: '#41474e', lineHeight: 18 },
});