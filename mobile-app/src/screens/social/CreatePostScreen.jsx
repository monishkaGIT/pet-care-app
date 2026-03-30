import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreatePostScreen({ navigation }) {
    const [caption, setCaption] = useState('');
    const [selectedPet, setSelectedPet] = useState('Luna');

    const PETS = ['Luna', 'Milo', 'Socks'];
    const HASHTAGS = ['#doggo', '#catlife', '#pawsome', '#petstagram'];

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <MaterialIcons name="close" size={26} color="#30628a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Post</Text>
                <TouchableOpacity
                    style={styles.postBtn}
                    activeOpacity={0.85}
                    onPress={() => Alert.alert('Post shared!', 'Your post has been published.')}
                >
                    <Text style={styles.postBtnText}>POST</Text>
                </TouchableOpacity>
            </View>

            {/* Composer */}
            <View style={styles.composerCard}>
                <TextInput
                    style={styles.composerInput}
                    placeholder="What's happening in your pet's world?"
                    placeholderTextColor="#c1c7cf"
                    multiline
                    value={caption}
                    onChangeText={setCaption}
                />

                {/* Add Photo */}
                <TouchableOpacity style={styles.photoSlot} activeOpacity={0.8}>
                    <MaterialIcons name="add-photo-alternate" size={32} color="#30628a" />
                </TouchableOpacity>

                {/* Hashtags */}
                <View style={styles.hashtagsRow}>
                    {HASHTAGS.map(tag => (
                        <TouchableOpacity key={tag} style={styles.hashtagChip} activeOpacity={0.7}>
                            <Text style={styles.hashtagText}>{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Pet Selection */}
            <View style={styles.petSection}>
                <View style={styles.petSectionHeader}>
                    <Text style={styles.petSectionTitle}>SELECT PET</Text>
                    <TouchableOpacity style={styles.newPetBtn}>
                        <MaterialIcons name="add" size={16} color="#30628a" />
                        <Text style={styles.newPetText}>NEW PET</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.petChipsRow}>
                    {PETS.map(pet => (
                        <TouchableOpacity
                            key={pet}
                            style={[styles.petChip, selectedPet === pet && styles.petChipActive]}
                            onPress={() => setSelectedPet(pet)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.petChipIcon, selectedPet === pet && styles.petChipIconActive]}>
                                <MaterialIcons name="pets" size={14} color={selectedPet === pet ? '#ffffff' : '#79573f'} />
                            </View>
                            <Text style={[styles.petChipText, selectedPet === pet && styles.petChipTextActive]}>{pet}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Tool Actions */}
            <View style={styles.toolSection}>
                {[
                    { icon: 'location-on', label: 'Add Location' },
                    { icon: 'person-add', label: 'Tag Friends' },
                    { icon: 'public', label: 'Audience: Everyone' },
                ].map((item, i) => (
                    <TouchableOpacity key={i} style={styles.toolRow} activeOpacity={0.8}>
                        <MaterialIcons name={item.icon} size={22} color="#30628a" />
                        <Text style={styles.toolLabel}>{item.label}</Text>
                        <MaterialIcons name="chevron-right" size={20} color="#c1c7cf" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    header: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: 'rgba(111,78,55,0.08)', shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 1, elevation: 4,
    },
    closeBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#30628a' },
    postBtn: {
        backgroundColor: '#f59e0b', paddingVertical: 9, paddingHorizontal: 22,
        borderRadius: 20,
        shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
    },
    postBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },
    composerCard: {
        backgroundColor: '#faf3e0',
        borderRadius: 28, marginHorizontal: 16, marginTop: 20, padding: 20,
        shadowColor: 'rgba(111,78,55,0.08)', shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 1, elevation: 2,
    },
    composerInput: {
        fontSize: 18, color: '#1e1c10', minHeight: 100, textAlignVertical: 'top',
        lineHeight: 26,
    },
    photoSlot: {
        width: 88, height: 88, borderRadius: 16,
        backgroundColor: 'rgba(162,210,255,0.2)',
        borderWidth: 2, borderColor: 'rgba(162,210,255,0.4)', borderStyle: 'dashed',
        alignItems: 'center', justifyContent: 'center', marginTop: 12,
    },
    hashtagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(193,199,207,0.2)' },
    hashtagChip: { backgroundColor: 'rgba(162,210,255,0.3)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    hashtagText: { color: '#30628a', fontWeight: 'bold', fontSize: 12 },
    petSection: { marginHorizontal: 16, marginTop: 20 },
    petSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    petSectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#79573f', letterSpacing: 2 },
    newPetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    newPetText: { fontSize: 11, fontWeight: 'bold', color: '#30628a', letterSpacing: 1 },
    petChipsRow: { flexDirection: 'row', gap: 10 },
    petChip: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#efe8d5', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 22,
    },
    petChipActive: { backgroundColor: '#f59e0b' },
    petChipIcon: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center', justifyContent: 'center',
    },
    petChipIconActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
    petChipText: { fontSize: 14, fontWeight: '600', color: '#79573f' },
    petChipTextActive: { color: '#ffffff' },
    toolSection: { marginHorizontal: 16, marginTop: 16, gap: 8 },
    toolRow: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: '#ffffff', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 16,
        shadowColor: 'rgba(111,78,55,0.04)', shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, shadowOpacity: 1, elevation: 1,
    },
    toolLabel: { fontSize: 14, fontWeight: 'bold', color: '#79573f' },
});
