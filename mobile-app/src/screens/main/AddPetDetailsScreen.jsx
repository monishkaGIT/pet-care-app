import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { petApi } from '../../api/axiosConfig';

export default function AddPetDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const petType = route.params?.petType || 'dog';

    const [name, setName] = useState('');
    const [breed, setBreed] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [gender, setGender] = useState(null);
    const [color, setColor] = useState('');
    const [toggles, setToggles] = useState({ neutered: false, microchipped: false, vaccinated: false });
    const [loading, setLoading] = useState(false);

    const toggleOption = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

    const handleSave = async () => {
        if (!name.trim()) return Alert.alert('Missing info', 'Please enter your pet\'s name.');
        setLoading(true);
        try {
            await petApi.post('/', {
                name: name.trim(),
                type: petType,
                breed: breed.trim(),
                age: parseFloat(age) || 0,
                weight: parseFloat(weight) || 0,
                gender: gender || 'unknown',
                color: color.trim(),
                neutered: toggles.neutered,
                microchipped: toggles.microchipped,
                vaccinated: toggles.vaccinated,
            });
            Alert.alert('🎉 Success!', `${name} has been added to your pet family!`, [
                { text: 'OK', onPress: () => navigation.navigate('MyPetsList') }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Could not save pet. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <MaterialIcons name="arrow-back" size={24} color="#30628a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    Tell us about {name || `your ${petType}`}
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.formCard}>

                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Pet Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Luna, Milo, Cooper"
                            value={name} onChangeText={setName}
                            placeholderTextColor="#72787f"
                        />
                    </View>

                    {/* Breed */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Breed</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Golden Retriever"
                            value={breed} onChangeText={setBreed}
                            placeholderTextColor="#72787f"
                        />
                    </View>

                    {/* Age & Weight */}
                    <View style={styles.rowFields}>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Age (Years)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                value={age} onChangeText={setAge}
                                keyboardType="numeric"
                                placeholderTextColor="#72787f"
                            />
                        </View>
                        <View style={{ width: 14 }} />
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.0"
                                value={weight} onChangeText={setWeight}
                                keyboardType="decimal-pad"
                                placeholderTextColor="#72787f"
                            />
                        </View>
                    </View>

                    {/* Gender */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.genderRow}>
                            {['male', 'female'].map(g => (
                                <TouchableOpacity
                                    key={g}
                                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                                    onPress={() => setGender(g)} activeOpacity={0.8}
                                >
                                    <MaterialIcons
                                        name={g}
                                        size={20}
                                        color={gender === g ? '#275b82' : '#41474e'}
                                    />
                                    <Text style={[styles.genderLabel, gender === g && styles.genderLabelActive]}>
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Color */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Color / Markings</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Golden, Black & White"
                            value={color} onChangeText={setColor}
                            placeholderTextColor="#72787f"
                        />
                    </View>

                    {/* Toggles */}
                    <View style={styles.toggleSection}>
                        <Text style={styles.toggleSectionLabel}>QUICK HEALTH STATUS</Text>
                        <View style={styles.toggleRow}>
                            {[
                                { key: 'neutered', label: 'Neutered/Spayed' },
                                { key: 'microchipped', label: 'Microchipped' },
                                { key: 'vaccinated', label: 'Vaccinated' },
                            ].map(item => (
                                <TouchableOpacity
                                    key={item.key}
                                    style={[styles.toggleChip, toggles[item.key] && styles.toggleChipActive]}
                                    onPress={() => toggleOption(item.key)}
                                    activeOpacity={0.8}
                                >
                                    {toggles[item.key] && (
                                        <MaterialIcons name="check" size={14} color="#275b82" />
                                    )}
                                    <Text style={[styles.toggleChipText, toggles[item.key] && styles.toggleChipTextActive]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Save */}
                    <TouchableOpacity
                        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                        activeOpacity={0.85}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <>
                                <MaterialIcons name="save" size={22} color="#ffffff" />
                                <Text style={styles.saveBtnText}>Save Profile</Text>
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
        backgroundColor: '#a2d2ff', borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#79573f', marginHorizontal: 10, textAlign: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },
    formCard: { backgroundColor: '#faf3e0', borderRadius: 20, padding: 24 },
    fieldGroup: { marginBottom: 20 },
    label: { fontSize: 12, fontWeight: '700', color: '#79573f', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
    input: {
        height: 52, backgroundColor: '#ffffff',
        borderWidth: 1.5, borderColor: '#D9CFBC', borderRadius: 12,
        paddingHorizontal: 18, fontSize: 15, color: '#1e1c10',
    },
    rowFields: { flexDirection: 'row' },
    genderRow: { flexDirection: 'row', gap: 12 },
    genderBtn: {
        flex: 1, height: 52, backgroundColor: '#ffffff',
        borderWidth: 1.5, borderColor: '#D9CFBC', borderRadius: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    genderBtnActive: { backgroundColor: '#a2d2ff', borderColor: '#30628a' },
    genderLabel: { fontSize: 14, fontWeight: '600', color: '#41474e' },
    genderLabelActive: { color: '#275b82' },
    toggleSection: { backgroundColor: 'rgba(233,226,208,0.5)', borderRadius: 12, padding: 16, marginBottom: 24 },
    toggleSectionLabel: { fontSize: 10, fontWeight: 'bold', color: 'rgba(121,87,63,0.6)', letterSpacing: 2, marginBottom: 12 },
    toggleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    toggleChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingVertical: 8, paddingHorizontal: 14,
        backgroundColor: '#ffffff', borderWidth: 1.5, borderColor: '#D9CFBC', borderRadius: 20,
    },
    toggleChipActive: { backgroundColor: '#a2d2ff', borderColor: '#30628a' },
    toggleChipText: { fontSize: 12, fontWeight: '500', color: '#79573f' },
    toggleChipTextActive: { color: '#275b82', fontWeight: '700' },
    saveBtn: {
        backgroundColor: '#D4A017', height: 58, borderRadius: 30,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        shadowColor: '#D4A017', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
    },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 17 },
});
