import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, KeyboardAvoidingView, Platform, StatusBar, Image,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/theme';
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

    const TOGGLE_OPTIONS = [
        { key: 'isNeutered', label: 'Neutered / Spayed', icon: 'content-cut' },
        { key: 'isMicrochipped', label: 'Microchipped', icon: 'nfc' },
        { key: 'isVaccinated', label: 'Vaccinated', icon: 'vaccines' },
    ];

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff9ec' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <PetCareModal {...modalProps} />
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

                {/* ── Hero Header ─────────────────────────────────────── */}
                <View style={styles.hero}>
                    <View style={styles.heroTopBar}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                            <MaterialIcons name="arrow-back" size={24} color="#30628a" />
                        </TouchableOpacity>
                        <Text style={styles.heroBrand}>PetCare</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <Text style={styles.heroTitle}>Add a New Pet</Text>
                    <Text style={styles.heroSubtitle}>
                        Tell us about your furry friend so we can help you care for them.
                    </Text>
                </View>

                {/* ── Photo Picker ────────────────────────────────────── */}
                <View style={styles.photoSection}>
                    <TouchableOpacity style={styles.photoBtn} onPress={pickImage} activeOpacity={0.85}>
                        {form.profileImage ? (
                            <Image source={{ uri: form.profileImage }} style={styles.photoImage} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <View style={styles.photoIconCircle}>
                                    <MaterialIcons name="pets" size={32} color="#30628a" />
                                </View>
                                <MaterialIcons name="add-a-photo" size={18} color="#79573f" style={styles.cameraBadge} />
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.photoHint}>Tap to add a photo</Text>
                </View>

                {/* ── Basic Info Card ────────────────────────────────── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="info-outline" size={18} color="#79573f" />
                        <Text style={styles.cardTitle}>Basic Information</Text>
                    </View>

                    {/* Name */}
                    <Text style={styles.label}>PET NAME</Text>
                    <View style={styles.inputWrap}>
                        <MaterialIcons name="pets" size={18} color="#a19078" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Buddy"
                            placeholderTextColor="#b0a898"
                            value={form.name}
                            onChangeText={(v) => setForm(prev => ({ ...prev, name: v }))}
                        />
                    </View>

                    {/* Breed */}
                    <Text style={styles.label}>BREED</Text>
                    <View style={styles.inputWrap}>
                        <MaterialIcons name="category" size={18} color="#a19078" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Golden Retriever"
                            placeholderTextColor="#b0a898"
                            value={form.breed}
                            onChangeText={(v) => setForm(prev => ({ ...prev, breed: v }))}
                        />
                    </View>

                    {/* Age + Weight Row */}
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>AGE (YEARS)</Text>
                            <View style={styles.inputWrap}>
                                <MaterialIcons name="cake" size={18} color="#a19078" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    placeholderTextColor="#b0a898"
                                    keyboardType="numeric"
                                    value={form.age}
                                    onChangeText={(v) => setForm(prev => ({ ...prev, age: v }))}
                                />
                            </View>
                        </View>
                        <View style={{ width: 14 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>WEIGHT (KG)</Text>
                            <View style={styles.inputWrap}>
                                <MaterialIcons name="fitness-center" size={18} color="#a19078" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.0"
                                    placeholderTextColor="#b0a898"
                                    keyboardType="numeric"
                                    value={form.weight}
                                    onChangeText={(v) => setForm(prev => ({ ...prev, weight: v }))}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* ── Gender & Appearance Card ───────────────────────── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="palette" size={18} color="#79573f" />
                        <Text style={styles.cardTitle}>Appearance</Text>
                    </View>

                    {/* Gender */}
                    <Text style={styles.label}>GENDER</Text>
                    <View style={styles.genderRow}>
                        <TouchableOpacity
                            style={[styles.genderBtn, form.gender === 'Male' && styles.genderBtnActive]}
                            onPress={() => setForm(prev => ({ ...prev, gender: 'Male' }))}
                            activeOpacity={0.85}
                        >
                            <MaterialIcons
                                name="male"
                                size={20}
                                color={form.gender === 'Male' ? '#30628a' : '#72787f'}
                            />
                            <Text style={[styles.genderText, form.gender === 'Male' && styles.genderTextActive]}>
                                Male
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.genderBtn, form.gender === 'Female' && styles.genderBtnActive]}
                            onPress={() => setForm(prev => ({ ...prev, gender: 'Female' }))}
                            activeOpacity={0.85}
                        >
                            <MaterialIcons
                                name="female"
                                size={20}
                                color={form.gender === 'Female' ? '#e74c8b' : '#72787f'}
                            />
                            <Text style={[styles.genderText, form.gender === 'Female' && styles.genderTextActive]}>
                                Female
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Color */}
                    <Text style={styles.label}>COLOR / MARKINGS</Text>
                    <View style={styles.inputWrap}>
                        <MaterialIcons name="color-lens" size={18} color="#a19078" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { minHeight: 56, textAlignVertical: 'top' }]}
                            placeholder="e.g. Honey Gold with white spots"
                            placeholderTextColor="#b0a898"
                            multiline
                            value={form.color}
                            onChangeText={(v) => setForm(prev => ({ ...prev, color: v }))}
                        />
                    </View>
                </View>

                {/* ── Health Toggles Card ────────────────────────────── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="medical-services" size={18} color="#79573f" />
                        <Text style={styles.cardTitle}>Health Details</Text>
                    </View>

                    {TOGGLE_OPTIONS.map((opt) => (
                        <TouchableOpacity
                            key={opt.key}
                            style={[styles.toggleRow, form[opt.key] && styles.toggleRowActive]}
                            onPress={() => toggleField(opt.key)}
                            activeOpacity={0.85}
                        >
                            <View style={[styles.toggleIconWrap, form[opt.key] && styles.toggleIconWrapActive]}>
                                <MaterialIcons
                                    name={opt.icon}
                                    size={20}
                                    color={form[opt.key] ? '#ffffff' : '#79573f'}
                                />
                            </View>
                            <Text style={[styles.toggleLabel, form[opt.key] && styles.toggleLabelActive]}>
                                {opt.label}
                            </Text>
                            <View style={[styles.toggleCheck, form[opt.key] && styles.toggleCheckActive]}>
                                {form[opt.key] && (
                                    <MaterialIcons name="check" size={16} color="#ffffff" />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Save Button ────────────────────────────────────── */}
                <TouchableOpacity
                    style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.9}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                        <MaterialIcons name="check-circle" size={22} color="#ffffff" />
                    )}
                    <Text style={styles.saveBtnText}>
                        {loading ? 'Saving...' : 'Save Pet Profile'}
                    </Text>
                </TouchableOpacity>

                {/* Cancel link */}
                <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff9ec',
    },

    // ── Hero Header ──
    hero: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 18,
        paddingBottom: 32,
    },
    heroTopBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroBrand: {
        fontSize: 20,
        fontWeight: '800',
        color: '#79573f',
    },
    heroTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: '#1b3d5e',
        marginBottom: 6,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#275b82',
        lineHeight: 20,
        fontWeight: '500',
        textAlign: 'center',
    },

    // ── Photo Picker ──
    photoSection: {
        alignItems: 'center',
        marginTop: -40,
        marginBottom: 8,
    },
    photoBtn: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        borderWidth: 3,
        borderColor: '#a2d2ff',
        shadowColor: '#30628a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    photoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    photoPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(162,210,255,0.2)',
    },
    photoIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(162,210,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
    },
    photoHint: {
        fontSize: 12,
        color: '#72787f',
        marginTop: 8,
        fontWeight: '600',
    },

    // ── Cards ──
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#efe8d5',
        shadowColor: 'rgba(111,78,55,0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 1,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#faf3e0',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#79573f',
    },

    // ── Labels & Inputs ──
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: '#72787f',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginTop: 14,
        marginBottom: 6,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#faf3e0',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#efe8d5',
        paddingHorizontal: 14,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 13,
        fontSize: 15,
        color: '#1e1c10',
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
    },

    // ── Gender ──
    genderRow: {
        flexDirection: 'row',
        gap: 12,
    },
    genderBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#efe8d5',
        backgroundColor: '#faf3e0',
    },
    genderBtnActive: {
        borderColor: '#30628a',
        backgroundColor: 'rgba(162,210,255,0.2)',
    },
    genderText: {
        fontSize: 15,
        color: '#72787f',
        fontWeight: '600',
    },
    genderTextActive: {
        color: '#30628a',
        fontWeight: '700',
    },

    // ── Health Toggles ──
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: '#faf3e0',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#efe8d5',
    },
    toggleRowActive: {
        backgroundColor: 'rgba(162,210,255,0.15)',
        borderColor: 'rgba(48,98,138,0.25)',
    },
    toggleIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleIconWrapActive: {
        backgroundColor: '#30628a',
    },
    toggleLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#41474e',
    },
    toggleLabelActive: {
        color: '#30628a',
        fontWeight: '700',
    },
    toggleCheck: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: '#d0c8b8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleCheckActive: {
        borderColor: '#30628a',
        backgroundColor: '#30628a',
    },

    // ── Save Button ──
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#30628a',
        marginHorizontal: 20,
        marginTop: 28,
        paddingVertical: 17,
        borderRadius: 28,
        shadowColor: '#30628a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    saveBtnText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 17,
    },

    // ── Cancel ──
    cancelLink: {
        alignItems: 'center',
        marginTop: 16,
    },
    cancelText: {
        fontSize: 15,
        color: '#72787f',
        fontWeight: '600',
    },
});
