import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchPetById, updatePet } from '../../api/petApi';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

export default function EditPetScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { petId } = route.params;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalProps, showModal] = usePetCareModal();
    const [form, setForm] = useState({
        name: '', breed: '', age: '', weight: '',
        gender: 'Male', color: '',
        isNeutered: false, isMicrochipped: false, isVaccinated: false, profileImage: ''
    });

    useEffect(() => {
        loadPet();
    }, [petId]);

    const loadPet = async () => {
        try {
            const pet = await fetchPetById(petId);
            setForm({
                name: pet.name || '',
                breed: pet.breed || '',
                age: String(pet.age || ''),
                weight: String(pet.weight || ''),
                gender: pet.gender || 'Male',
                color: pet.color || '',
                isNeutered: pet.isNeutered || false,
                isMicrochipped: pet.isMicrochipped || false,
                isVaccinated: pet.isVaccinated || false,
                profileImage: pet.profileImage || '',
            });
        } catch (e) {
            showModal('error', 'Error', 'Failed to load pet data.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true
        });
        if (!result.canceled) {
            setForm(prev => ({ ...prev, profileImage: `data:image/jpeg;base64,${result.assets[0].base64}` }));
        }
    };

    const handleUpdate = async () => {
        if (!form.name.trim()) {
            showModal('warning', 'Missing Name', "Please enter your pet's name.");
            return;
        }
        if (form.name.trim().length < 2) {
            showModal('warning', 'Invalid Name', 'Pet name must be at least 2 characters.');
            return;
        }
        if (!form.breed.trim()) {
            showModal('warning', 'Missing Breed', "Please enter your pet's breed.");
            return;
        }
        if (form.age && (isNaN(parseFloat(form.age)) || parseFloat(form.age) < 0 || parseFloat(form.age) > 30)) {
            showModal('warning', 'Invalid Age', 'Please enter a valid age between 0 and 30 years.');
            return;
        }
        if (form.weight && (isNaN(parseFloat(form.weight)) || parseFloat(form.weight) < 0 || parseFloat(form.weight) > 200)) {
            showModal('warning', 'Invalid Weight', 'Please enter a valid weight between 0 and 200 kg.');
            return;
        }
        setSaving(true);
        try {
            await updatePet(petId, {
                ...form,
                age: parseFloat(form.age) || 0,
                weight: parseFloat(form.weight) || 0,
            });
            navigation.goBack();
        } catch (e) {
            showModal('error', 'Error', 'Failed to update pet profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <PetCareModal {...modalProps} />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="menu" size={26} color="#fff" />
                        </TouchableOpacity>
                        <Text style={[styles.headerBrand, { color: '#fff' }]}>PetCare</Text>
                        {/* Empty view to balance flex space if needed, or simply removed right circle */}
                        <View style={{ width: 26 }} />
                    </View>
                </View>

                {/* Form Content */}
                <View style={styles.formWrapper}>
                    <Text style={styles.editTitle}>Edit {form.name || 'Pet'}</Text>
                    <Text style={styles.editDesc}>
                        Keep {form.name || 'your pet'}'s health and personality details up to date.
                    </Text>

                    {/* Pet Image */}
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage} activeOpacity={0.8}>
                            {form.profileImage ? (
                                <Image source={{ uri: form.profileImage }} style={styles.petImage} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="camera" size={32} color={COLORS.secondary} />
                                    <Text style={styles.imagePlaceholderText}>Change Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Pet Name */}
                    <Text style={styles.label}>PET NAME</Text>
                    <TextInput
                        style={styles.input}
                        value={form.name}
                        onChangeText={(v) => setForm(prev => ({ ...prev, name: v }))}
                        placeholder="Enter pet name"
                        placeholderTextColor={COLORS.textPlaceholder}
                    />

                    {/* Breed */}
                    <Text style={styles.label}>BREED</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#faf0e4' }]}
                        value={form.breed}
                        onChangeText={(v) => setForm(prev => ({ ...prev, breed: v }))}
                        placeholder="e.g. Golden Retriever"
                        placeholderTextColor={COLORS.textPlaceholder}
                    />

                    {/* Age + Gender Row */}
                    <View style={styles.row}>
                        <View style={{ flex: 0.4 }}>
                            <Text style={styles.label}>AGE{'\n'}(YEARS)</Text>
                            <TextInput
                                style={styles.input}
                                value={form.age}
                                onChangeText={(v) => setForm(prev => ({ ...prev, age: v }))}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.textPlaceholder}
                            />
                        </View>
                        <View style={{ flex: 0.6, marginLeft: 16 }}>
                            <Text style={styles.label}>GENDER</Text>
                            <View style={styles.genderRow}>
                                <TouchableOpacity
                                    style={[styles.genderBtn, form.gender === 'Female' && styles.genderBtnActive]}
                                    onPress={() => setForm(prev => ({ ...prev, gender: 'Female' }))}
                                >
                                    <Text style={[styles.genderText, form.gender === 'Female' && styles.genderTextActive]}>
                                        Female
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.genderBtn, form.gender === 'Male' && styles.genderBtnActive]}
                                    onPress={() => setForm(prev => ({ ...prev, gender: 'Male' }))}
                                >
                                    <Text style={[styles.genderText, form.gender === 'Male' && styles.genderTextActive]}>
                                        Male
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Weight + Color Row */}
                    <View style={styles.row}>
                        <View style={{ flex: 0.4 }}>
                            <Text style={styles.label}>WEIGHT{'\n'}(KG)</Text>
                            <TextInput
                                style={styles.input}
                                value={form.weight}
                                onChangeText={(v) => setForm(prev => ({ ...prev, weight: v }))}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.textPlaceholder}
                            />
                        </View>
                        <View style={{ flex: 0.6, marginLeft: 16 }}>
                            <Text style={styles.label}>COLOR</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#faf0e4' }]}
                                value={form.color}
                                onChangeText={(v) => setForm(prev => ({ ...prev, color: v }))}
                                placeholder="e.g. Honey Gold"
                                placeholderTextColor={COLORS.textPlaceholder}
                            />
                        </View>
                    </View>

                    {/* Update Button */}
                    <TouchableOpacity
                        style={[styles.updateBtn, saving && { opacity: 0.6 }]}
                        onPress={handleUpdate}
                        disabled={saving}
                    >
                        <Ionicons name="save" size={20} color="#fff" />
                        <Text style={styles.updateBtnText}>
                            {saving ? 'Updating...' : 'Update Profile'}
                        </Text>
                    </TouchableOpacity>

                    {/* Cancel */}
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.lightGray },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.lightGray },

    // Header
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 50, paddingBottom: 25,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        ...SHADOWS.header,
    },
    headerTopRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    headerBrand: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary },
    profileInitials: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#fde8d8', justifyContent: 'center', alignItems: 'center',
    },
    initialsText: { fontSize: 14, fontWeight: 'bold', color: COLORS.secondary },

    // Form
    formWrapper: { paddingHorizontal: 24, paddingTop: 24 },
    editTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.textPrimary },
    editDesc: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, marginBottom: 20, lineHeight: 20 },

    imagePickerContainer: { alignItems: 'center', marginBottom: 20 },
    imagePickerBtn: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#faf0e4', borderWidth: 2, borderColor: COLORS.secondary, borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
    },
    petImage: { width: '100%', height: '100%', borderRadius: 50 },
    imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    imagePlaceholderText: { fontSize: 10, color: COLORS.secondary, fontWeight: 'bold', marginTop: 4 },

    label: { fontSize: 12, fontWeight: 'bold', color: COLORS.textMuted, letterSpacing: 0.5, marginTop: 16, marginBottom: 6 },
    input: {
        backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder,
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 15, color: COLORS.textPrimary,
    },
    row: { flexDirection: 'row', marginTop: 4 },

    // Gender
    genderRow: { flexDirection: 'row', gap: 10 },
    genderBtn: {
        flex: 1, alignItems: 'center', paddingVertical: 12,
        borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.inputBorder,
        backgroundColor: COLORS.inputBg,
    },
    genderBtnActive: { borderColor: COLORS.secondary, backgroundColor: '#fde8d8' },
    genderText: { fontSize: 14, color: COLORS.textMuted },
    genderTextActive: { color: COLORS.secondary, fontWeight: '600' },

    // Update Button
    updateBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#c8952e', marginTop: 30,
        paddingVertical: 16, borderRadius: 30,
        elevation: 4,
    },
    updateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17, marginLeft: 10 },

    // Cancel
    cancelBtn: { alignItems: 'center', marginTop: 16 },
    cancelText: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600' },
});
