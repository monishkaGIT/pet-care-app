import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PET_TYPES = [
    { id: 'dog', label: 'Dog', icon: 'pets' },
    { id: 'cat', label: 'Cat', icon: 'cruelty-free' },
    { id: 'rabbit', label: 'Rabbit', icon: 'cruelty-free' },
    { id: 'bird', label: 'Bird', icon: 'pets' },
    { id: 'fish', label: 'Fish', icon: 'water' },
    { id: 'other', label: 'Other', icon: 'more-horiz' },
];

export default function AddPetSelectTypeScreen() {
    const navigation = useNavigation();
    const [selected, setSelected] = useState(null);

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <MaterialIcons name="arrow-back" size={24} color="#30628a" />
                </TouchableOpacity>
                <Text style={styles.brandText}>PetCare</Text>
                <View style={styles.avatarIcon}>
                    <MaterialIcons name="person" size={22} color="#30628a" />
                </View>
            </View>

            {/* Content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <Text style={styles.headlineTitle}>What kind of{'\n'}friend?</Text>
                <Text style={styles.headlineSub}>Every great journey begins with a name and a paw print.</Text>

                {/* Pet Type Grid */}
                <View style={styles.grid}>
                    {PET_TYPES.map((pet, index) => (
                        <TouchableOpacity
                            key={pet.id}
                            style={[
                                styles.petTypeCard,
                                index % 2 === 1 && styles.petTypeCardOffset,
                                selected === pet.id && styles.petTypeCardSelected,
                            ]}
                            activeOpacity={0.85}
                            onPress={() => setSelected(pet.id)}
                        >
                            <View style={[styles.petTypeIconWrap, selected === pet.id && styles.petTypeIconWrapSelected]}>
                                <MaterialIcons name={pet.icon} size={40} color={selected === pet.id ? '#275b82' : '#79573f'} />
                            </View>
                            <Text style={styles.petTypeLabel}>{pet.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
                    activeOpacity={selected ? 0.85 : 1}
                    onPress={() => selected && navigation.navigate('AddPetDetails', { petType: selected })}
                >
                    <Text style={[styles.continueBtnText, !selected && styles.continueBtnTextDisabled]}>Continue</Text>
                </TouchableOpacity>
                {!selected && (
                    <Text style={styles.chooseHint}>Choose one to proceed with your pet's profile</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    header: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center', justifyContent: 'center',
    },
    brandText: { fontSize: 22, fontWeight: 'bold', color: '#79573f' },
    avatarIcon: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#ffffff', borderWidth: 2, borderColor: 'rgba(162,210,255,0.5)',
        alignItems: 'center', justifyContent: 'center',
    },
    content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 },
    headlineTitle: { fontSize: 36, fontWeight: '800', color: '#79573f', lineHeight: 42, marginBottom: 12 },
    headlineSub: { fontSize: 16, color: '#41474e', marginBottom: 36, lineHeight: 22 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    petTypeCard: {
        width: '44%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2, borderColor: 'transparent',
        shadowColor: 'rgba(111,78,55,0.05)', shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 1,
        elevation: 2,
    },
    petTypeCardOffset: { marginTop: 16 },
    petTypeCardSelected: {
        borderColor: '#a2d2ff',
        backgroundColor: '#f0f8ff',
    },
    petTypeIconWrap: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: '#faf3e0',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
    },
    petTypeIconWrapSelected: { backgroundColor: '#a2d2ff' },
    petTypeLabel: { fontSize: 16, fontWeight: 'bold', color: '#79573f' },
    continueBtn: {
        marginTop: 32, backgroundColor: '#30628a',
        paddingVertical: 18, borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#30628a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
    },
    continueBtnDisabled: { backgroundColor: '#e9e2d0', shadowOpacity: 0, elevation: 0 },
    continueBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 17 },
    continueBtnTextDisabled: { color: '#72787f' },
    chooseHint: { textAlign: 'center', color: '#41474e', fontSize: 13, marginTop: 10 },
});
