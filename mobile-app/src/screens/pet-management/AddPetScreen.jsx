import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, KeyboardAvoidingView, Platform, StatusBar, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS } from '../../constants/theme';
import { createPet } from '../../api/petApi';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

export default function AddPetScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [modalProps, showModal] = usePetCareModal();
    const [form, setForm] = useState({
        name: '',
        breed: '',
        age: '',
        weight: '',
        gender: 'Male',
        color: '',
        isNeutered: false,
        isMicrochipped: false,
        isVaccinated: false,
        profileImage: '',
    });

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

    const toggleField = (field) => setForm(prev => ({ ...prev, [field]: !prev[field] }));

    const handleSave = async () => {
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
        setLoading(true);
        try {
            await createPet({
                ...form,
                age: parseFloat(form.age) || 0,
                weight: parseFloat(form.weight) || 0,
            });
            showModal('success', 'Success', 'Pet added successfully!', [
                { text: 'OK', style: 'primary', onPress: () => navigation.goBack() },
            ]);
        } catch (e) {
            showModal('error', 'Error', 'Failed to save pet profile.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <PetCareModal {...modalProps} />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        Tell us about{'\n'}
                        {form.name ? `[${form.name}]` : '[Pet Name]'}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    {/* Pet Image */}
                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage} activeOpacity={0.8}>
                            {form.profileImage ? (
                                <Image source={{ uri: form.profileImage }} style={styles.petImage} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="camera" size={32} color={COLORS.secondary} />
                                    <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Name */}
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter pet name"
                        placeholderTextColor={COLORS.textPlaceholder}
                        value={form.name}
                        onChangeText={(v) => setForm(prev => ({ ...prev, name: v }))}
                    />

                    {/* Breed */}
                    <Text style={styles.label}>Breed</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Golden Retriever"
                        placeholderTextColor={COLORS.textPlaceholder}
                        value={form.breed}
                        onChangeText={(v) => setForm(prev => ({ ...prev, breed: v }))}
                    />

                    {/* Age + Weight Row */}
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.label}>Age (Years)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={COLORS.textPlaceholder}
                                keyboardType="numeric"
                                value={form.age}
                                onChangeText={(v) => setForm(prev => ({ ...prev, age: v }))}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.0"
                                placeholderTextColor={COLORS.textPlaceholder}
                                keyboardType="numeric"
                                value={form.weight}
                                onChangeText={(v) => setForm(prev => ({ ...prev, weight: v }))}
                            />
                        </View>
                    </View>

                    {/* Gender */}
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.genderRow}>
                        <TouchableOpacity
                            style={[styles.genderBtn, form.gender === 'Male' && styles.genderBtnActive]}
                            onPress={() => setForm(prev => ({ ...prev, gender: 'Male' }))}
                        >
                            <Ionicons name="male" size={16} color={form.gender === 'Male' ? COLORS.secondary : COLORS.textMuted} />
                            <Text style={[styles.genderText, form.gender === 'Male' && styles.genderTextActive]}>Male</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.genderBtn, form.gender === 'Female' && styles.genderBtnActive]}
                            onPress={() => setForm(prev => ({ ...prev, gender: 'Female' }))}
                        >
                            <Ionicons name="female" size={16} color={form.gender === 'Female' ? COLORS.secondary : COLORS.textMuted} />
                            <Text style={[styles.genderText, form.gender === 'Female' && styles.genderTextActive]}>Female</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Color */}
                    <Text style={styles.label}>Color / Markings</Text>
                    <TextInput
                        style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                        placeholder="Describe pet colors"
                        placeholderTextColor={COLORS.textPlaceholder}
                        multiline
                        value={form.color}
                        onChangeText={(v) => setForm(prev => ({ ...prev, color: v }))}
                    />
                </View>

                {/* Quick Toggles */}
                <View style={styles.toggleCard}>
                    <Text style={styles.toggleTitle}>QUICK TOGGLES</Text>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[styles.toggleChip, form.isNeutered && styles.toggleChipActive]}
                            onPress={() => toggleField('isNeutered')}
                        >
                            <Text style={[styles.toggleChipText, form.isNeutered && styles.toggleChipTextActive]}>
                                Neutered/Spayed
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleChip, form.isMicrochipped && styles.toggleChipActive]}
                            onPress={() => toggleField('isMicrochipped')}
                        >
                            <Text style={[styles.toggleChipText, form.isMicrochipped && styles.toggleChipTextActive]}>
                                Microchipped
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleChip, form.isVaccinated && styles.toggleChipActive]}
                            onPress={() => toggleField('isVaccinated')}
                        >
                            <Text style={[styles.toggleChipText, form.isVaccinated && styles.toggleChipTextActive]}>
                                Vaccinated
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Ionicons name="save" size={20} color="#fff" />
                    <Text style={styles.saveBtnText}>
                        {loading ? 'Saving...' : 'Save Profile'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.lightGray },

    // Header
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 50, paddingBottom: 25,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        alignItems: 'center', ...SHADOWS.header,
    },
    backBtn: { position: 'absolute', left: 20, top: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 50 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', lineHeight: 30 },
    profileIcon: {
        position: 'absolute', right: 20, top: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 50,
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center',
    },

    // Form
    formCard: {
        backgroundColor: COLORS.surface, margin: 20, marginTop: 24,
        borderRadius: 20, padding: 20, ...SHADOWS.card,
    },
    imagePickerContainer: { alignItems: 'center', marginBottom: 20 },
    imagePickerBtn: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#faf0e4', borderWidth: 2, borderColor: COLORS.secondary, borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
    },
    petImage: { width: '100%', height: '100%', borderRadius: 50 },
    imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
    imagePlaceholderText: { fontSize: 10, color: COLORS.secondary, fontWeight: 'bold', marginTop: 4 },
    label: { fontSize: 13, fontWeight: '600', color: COLORS.secondary, marginBottom: 6, marginTop: 14 },
    input: {
        backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.inputBorder,
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 15, color: COLORS.textPrimary,
    },
    row: { flexDirection: 'row' },

    // Gender
    genderRow: { flexDirection: 'row', gap: 12 },
    genderBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 12, borderRadius: 12,
        borderWidth: 1.5, borderColor: COLORS.inputBorder, backgroundColor: COLORS.inputBg,
    },
    genderBtnActive: { borderColor: COLORS.secondary, backgroundColor: '#faf0e4' },
    genderText: { marginLeft: 6, fontSize: 15, color: COLORS.textMuted },
    genderTextActive: { color: COLORS.secondary, fontWeight: '600' },

    // Toggle Card
    toggleCard: {
        backgroundColor: '#faf0e4', marginHorizontal: 20,
        borderRadius: 20, padding: 20,
    },
    toggleTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.secondary, letterSpacing: 1, marginBottom: 12 },
    toggleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    toggleChip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
        borderWidth: 1.5, borderColor: COLORS.secondary, backgroundColor: 'transparent',
    },
    toggleChipActive: { backgroundColor: COLORS.secondary },
    toggleChipText: { fontSize: 13, fontWeight: '600', color: COLORS.secondary },
    toggleChipTextActive: { color: '#fff' },

    // Save Button
    saveBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#c8952e', marginHorizontal: 40, marginTop: 28,
        paddingVertical: 16, borderRadius: 30,
        elevation: 4,
    },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17, marginLeft: 10 },
});
