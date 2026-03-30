import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { petApi } from '../../api/axiosConfig';

export default function EditPetProfileScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { pet } = route.params;

    const [name, setName] = useState(pet.name || '');
    const [breed, setBreed] = useState(pet.breed || '');
    const [age, setAge] = useState(pet.age?.toString() || '');
    const [weight, setWeight] = useState(pet.weight?.toString() || '');
    const [gender, setGender] = useState(pet.gender || null);
    const [color, setColor] = useState(pet.color || '');
    const [toggles, setToggles] = useState({
        neutered: !!pet.neutered,
        microchipped: !!pet.microchipped,
        vaccinated: !!pet.vaccinated,
    });
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const toggleOption = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

    const handleUpdate = async () => {
        if (!name.trim()) return Alert.alert('Missing info', "Pet name can't be empty.");
        setLoading(true);
        try {
            await petApi.put(`/${pet._id}`, {
                name: name.trim(),
                breed: breed.trim(),
                age: parseFloat(age) || 0,
                weight: parseFloat(weight) || 0,
                gender: gender || 'unknown',
                color: color.trim(),
                neutered: toggles.neutered,
                microchipped: toggles.microchipped,
                vaccinated: toggles.vaccinated,
            });
            Alert.alert('Updated!', `${name}'s profile has been updated.`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Could not update pet.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            `Delete ${pet.name}?`,
            'This will permanently remove this pet from your profile. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: async () => {
                        setDeleteLoading(true);
                        try {
                            await petApi.delete(`/${pet._id}`);
                            Alert.alert('Deleted', `${pet.name} has been removed.`, [
                                { text: 'OK', onPress: () => navigation.navigate('MyPetsList') }
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Could not delete pet.');
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
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <MaterialIcons name="arrow-back" size={24} color="#30628a" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerBrand}>PetCare</Text>
                    <View style={styles.avatarSmall}>
                        <MaterialIcons name="person" size={18} color="#30628a" />
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Editorial title */}
                <View style={styles.editorialSection}>
                    <Text style={styles.editorialTitle}>Edit {pet.name}</Text>
                    <Text style={styles.editorialSub}>
                        Keep {pet.name}'s health and personality details up to date.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>PET NAME</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#72787f" />
                    </View>

                    {/* Breed */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>BREED</Text>
                        <TextInput style={styles.input} value={breed} onChangeText={setBreed} placeholder="e.g. Golden Retriever" placeholderTextColor="#72787f" />
                    </View>

                    {/* Age & Gender row */}
                    <View style={styles.rowGrid}>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.label}>AGE (YEARS)</Text>
                            <TextInput
                                style={styles.input}
                                value={age} onChangeText={setAge}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#72787f"
                            />
                        </View>
                        <View style={{ width: 14 }} />
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.label}>GENDER</Text>
                            <View style={styles.genderRow}>
                                {['female', 'male'].map(g => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                                        onPress={() => setGender(g)} activeOpacity={0.8}
                                    >
                                        <Text style={[styles.genderLabel, gender === g && styles.genderLabelActive]}>
                                            {g.charAt(0).toUpperCase() + g.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Weight & Color */}
                    <View style={styles.rowGrid}>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.label}>WEIGHT (KG)</Text>
                            <TextInput
                                style={styles.input}
                                value={weight} onChangeText={setWeight}
                                keyboardType="decimal-pad"
                                placeholder="0.0"
                                placeholderTextColor="#72787f"
                            />
                        </View>
                        <View style={{ width: 14 }} />
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.label}>COLOR</Text>
                            <TextInput
                                style={styles.input}
                                value={color} onChangeText={setColor}
                                placeholder="e.g. Golden"
                                placeholderTextColor="#72787f"
                            />
                        </View>
                    </View>

                    {/* Health Toggles */}
                    <View style={styles.toggleSection}>
                        <Text style={styles.label}>HEALTH STATUS</Text>
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
                                    {toggles[item.key] && <MaterialIcons name="check" size={13} color="#275b82" />}
                                    <Text style={[styles.toggleChipText, toggles[item.key] && styles.toggleChipTextActive]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Action buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.updateBtn, loading && styles.btnDisabled]}
                            onPress={handleUpdate}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? <ActivityIndicator color="#ffffff" /> : (
                                <>
                                    <MaterialIcons name="save" size={20} color="#ffffff" />
                                    <Text style={styles.updateBtnText}>Update Profile</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.deleteBtn, deleteLoading && styles.btnDisabled]}
                            onPress={handleDelete}
                            disabled={deleteLoading}
                            activeOpacity={0.85}
                        >
                            {deleteLoading ? <ActivityIndicator color="#ba1a1a" /> : (
                                <>
                                    <MaterialIcons name="delete-forever" size={18} color="#ba1a1a" />
                                    <Text style={styles.deleteBtnText}>Remove {pet.name}</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    header: {
        backgroundColor: '#a2d2ff', borderBottomLeftRadius: 48, borderBottomRightRadius: 48,
        paddingHorizontal: 24, paddingTop: 10, paddingBottom: 32,
        flexDirection: 'row', alignItems: 'center',
        minHeight: 100,
    },
    backBtn: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 16 },
    headerBrand: { fontSize: 24, fontWeight: 'bold', color: '#79573f' },
    avatarSmall: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#ffffff', borderWidth: 2, borderColor: 'rgba(162,210,255,0.5)',
        alignItems: 'center', justifyContent: 'center',
    },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 60 },
    editorialSection: { paddingTop: 32, paddingBottom: 24 },
    editorialTitle: { fontSize: 38, fontWeight: '800', color: '#79573f', marginBottom: 8, lineHeight: 44 },
    editorialSub: { fontSize: 15, color: '#41474e', lineHeight: 22 },
    form: { gap: 0 },
    fieldGroup: { marginBottom: 20 },
    label: { fontSize: 11, fontWeight: 'bold', color: '#79573f', letterSpacing: 1.5, marginBottom: 8, marginLeft: 4 },
    input: {
        backgroundColor: '#efe8d5', borderRadius: 16,
        paddingHorizontal: 20, height: 56,
        fontSize: 16, color: '#1e1c10',
    },
    rowGrid: { flexDirection: 'row' },
    genderRow: { flexDirection: 'row', gap: 8 },
    genderBtn: {
        flex: 1, height: 56, backgroundColor: '#efe8d5',
        borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    },
    genderBtnActive: { backgroundColor: '#ffd1b3' },
    genderLabel: { fontSize: 14, fontWeight: '600', color: '#41474e' },
    genderLabelActive: { color: '#7a5840', fontWeight: 'bold' },
    toggleSection: { marginBottom: 24 },
    toggleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
    toggleChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingVertical: 9, paddingHorizontal: 16,
        backgroundColor: '#efe8d5', borderRadius: 22,
    },
    toggleChipActive: { backgroundColor: '#a2d2ff' },
    toggleChipText: { fontSize: 13, fontWeight: '500', color: '#79573f' },
    toggleChipTextActive: { color: '#275b82', fontWeight: '700' },
    actions: { gap: 12, paddingTop: 8 },
    updateBtn: {
        backgroundColor: '#D4A017', height: 60, borderRadius: 30,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        shadowColor: '#D4A017', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 6,
    },
    updateBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 17 },
    deleteBtn: {
        height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#ba1a1a',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#fff9ec',
    },
    deleteBtnText: { color: '#ba1a1a', fontWeight: 'bold', fontSize: 15 },
    cancelBtn: { height: 52, alignItems: 'center', justifyContent: 'center' },
    cancelBtnText: { color: '#79573f', fontWeight: '600', fontSize: 15 },
    btnDisabled: { opacity: 0.6 },
});
