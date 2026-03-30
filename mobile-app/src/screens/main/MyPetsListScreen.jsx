import React, { useCallback, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, SafeAreaView, ActivityIndicator, Image, RefreshControl, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { petApi } from '../../api/axiosConfig';

const PET_COLORS = [
    { bg: 'rgba(162,210,255,0.35)', icon: '#30628a' },
    { bg: 'rgba(255,209,179,0.4)',  icon: '#79573f' },
    { bg: 'rgba(255,192,146,0.4)',  icon: '#8e4e14' },
    { bg: 'rgba(162,210,255,0.2)',  icon: '#275b82' },
];

export default function MyPetsListScreen() {
    const navigation = useNavigation();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPets = useCallback(async () => {
        try {
            const { data } = await petApi.get('/');
            setPets(data);
        } catch (e) {
            Alert.alert('Error', 'Could not fetch your pets.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        setLoading(true);
        fetchPets();
    }, [fetchPets]));

    const onRefresh = () => { setRefreshing(true); fetchPets(); };

    const renderPet = ({ item, index }) => {
        const scheme = PET_COLORS[index % PET_COLORS.length];
        return (
            <TouchableOpacity
                style={styles.petCard}
                onPress={() => navigation.navigate('PetDetail', { pet: item })}
                activeOpacity={0.8}
            >
                {item.profileImage ? (
                    <Image source={{ uri: item.profileImage }} style={styles.petAvatar} />
                ) : (
                    <View style={[styles.petAvatarPlaceholder, { backgroundColor: scheme.bg }]}>
                        <MaterialIcons name="pets" size={30} color={scheme.icon} />
                    </View>
                )}
                <View style={styles.petInfo}>
                    <Text style={styles.petName}>{item.name}</Text>
                    <Text style={styles.petBreed}>{item.breed || item.type}</Text>
                    <Text style={styles.petMeta}>
                        {item.age > 0 ? `${item.age} yr${item.age !== 1 ? 's' : ''}` : 'Age ?'}
                        {item.weight > 0 ? ` · ${item.weight} kg` : ''}
                        {item.gender && item.gender !== 'unknown' ? ` · ${item.gender}` : ''}
                    </Text>
                    <View style={styles.tagRow}>
                        {item.vaccinated && <View style={styles.tag}><Text style={styles.tagText}>Vaccinated</Text></View>}
                        {item.neutered && <View style={styles.tag}><Text style={styles.tagText}>Neutered</Text></View>}
                        {item.microchipped && <View style={styles.tag}><Text style={styles.tagText}>Chipped</Text></View>}
                    </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#72787f" />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerBrand}>PetCare</Text>
                    <Text style={styles.headerTitle}>My Pets</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('UserProfile')}>
                    <MaterialIcons name="person" size={22} color="#30628a" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#30628a" />
                </View>
            ) : (
                <FlatList
                    data={pets}
                    keyExtractor={item => item._id}
                    renderItem={renderPet}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#30628a" />}
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <Text style={styles.listHeaderTitle}>Your furry family</Text>
                            <Text style={styles.listHeaderSub}>
                                {pets.length === 0
                                    ? "No pets added yet. Add your first one!"
                                    : `${pets.length} ${pets.length === 1 ? 'pet' : 'pets'} registered`}
                            </Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialIcons name="pets" size={64} color="#a2d2ff" />
                            <Text style={styles.emptyTitle}>No pets yet</Text>
                            <Text style={styles.emptySub}>Tap the + button to add your first pet.</Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('AddPetSelectType')}
            >
                <MaterialIcons name="add" size={28} color="#ffffff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    header: {
        backgroundColor: '#a2d2ff', borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
        paddingHorizontal: 28, paddingTop: 14, paddingBottom: 28,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    },
    headerBrand: { fontSize: 18, fontWeight: 'bold', color: '#79573f' },
    headerTitle: { fontSize: 30, fontWeight: '800', color: '#30628a', letterSpacing: -0.5 },
    profileBtn: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: '#ffffff', borderWidth: 2, borderColor: 'rgba(162,210,255,0.5)',
        alignItems: 'center', justifyContent: 'center',
    },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    listContent: { paddingHorizontal: 20, paddingBottom: 120 },
    listHeader: { paddingTop: 24, paddingBottom: 16 },
    listHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#79573f', marginBottom: 4 },
    listHeaderSub: { fontSize: 13, color: '#41474e' },
    petCard: {
        backgroundColor: '#ffffff', borderRadius: 16, padding: 18,
        flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12,
        borderWidth: 1, borderColor: '#efe8d5',
        shadowColor: 'rgba(111,78,55,0.04)', shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: 1, elevation: 1,
    },
    petAvatar: { width: 64, height: 64, borderRadius: 32 },
    petAvatarPlaceholder: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    petInfo: { flex: 1 },
    petName: { fontSize: 18, fontWeight: 'bold', color: '#79573f', marginBottom: 2 },
    petBreed: { fontSize: 13, color: '#41474e', fontWeight: '500', textTransform: 'capitalize' },
    petMeta: { fontSize: 12, color: '#72787f', marginTop: 2 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    tag: { backgroundColor: 'rgba(162,210,255,0.3)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    tagText: { fontSize: 10, color: '#30628a', fontWeight: 'bold' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#79573f', marginTop: 16, marginBottom: 8 },
    emptySub: { fontSize: 14, color: '#41474e', textAlign: 'center', paddingHorizontal: 40 },
    fab: {
        position: 'absolute', bottom: 100, right: 24,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#D4A017',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#D4A017', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
    },
});
