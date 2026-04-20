import React, { useCallback, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, SafeAreaView, ActivityIndicator, Image, RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchUserPets } from '../../api/petApi';
import BeagleLottie from '../../components/BeagleLottie';

const PET_COLORS = [
    { bg: 'rgba(162,210,255,0.35)', icon: '#30628a' },
    { bg: 'rgba(255,209,179,0.4)', icon: '#79573f' },
    { bg: 'rgba(255,192,146,0.4)', icon: '#8e4e14' },
    { bg: 'rgba(162,210,255,0.2)', icon: '#275b82' },
    { bg: '#faf3e0', icon: '#79573f' },
];

function PetCard({ pet, index, onPress }) {
    const scheme = PET_COLORS[index % PET_COLORS.length];
    return (
        <TouchableOpacity style={styles.petCard} onPress={onPress} activeOpacity={0.8}>
            {pet.profileImage ? (
                <Image source={{ uri: pet.profileImage }} style={styles.petAvatar} />
            ) : (
                <View style={[styles.petAvatarPlaceholder, { backgroundColor: scheme.bg }]}>
                    <MaterialIcons name="pets" size={28} color={scheme.icon} />
                </View>
            )}
            <View style={styles.petCardInfo}>
                <Text style={styles.petCardName}>{pet.name}</Text>
                <Text style={styles.petCardBreed}>{pet.breed || pet.type}</Text>
                <Text style={styles.petCardAge}>
                    {pet.age > 0 ? `${pet.age} yr${pet.age !== 1 ? 's' : ''} old` : 'Age unknown'}
                    {pet.weight > 0 ? ` · ${pet.weight} kg` : ''}
                </Text>
            </View>
            <View style={styles.petCardRight}>
                {pet.isVaccinated && (
                    <View style={styles.badge}>
                        <MaterialIcons name="verified" size={12} color="#30628a" />
                        <Text style={styles.badgeText}>Vaccinated</Text>
                    </View>
                )}
                <MaterialIcons name="chevron-right" size={22} color="#72787f" style={{ marginTop: 8 }} />
            </View>
        </TouchableOpacity>
    );
}

export default function HomeScreen() {
    const navigation = useNavigation();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPets = useCallback(async () => {
        try {
            const data = await fetchUserPets();
            setPets(data);
        } catch (e) {
            // silently fail — show empty state
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Refetch every time the tab is focused (e.g. after adding a pet)
    useFocusEffect(useCallback(() => {
        setLoading(true);
        fetchPets();
    }, [fetchPets]));

    const onRefresh = () => {
        setRefreshing(true);
        fetchPets();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#30628a" />}
            >
                {/* Header */}
                <View style={styles.headerWrapper}>
                    <View style={styles.glowTopRight} />
                    <View style={styles.glowMidLeft} />
                    <View style={styles.headerTopRow}>
                        <View style={styles.userInfoArea}>
                            <TouchableOpacity
                                style={styles.profileBtn}
                                onPress={() => navigation.navigate('UserProfile')}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="account-circle" size={32} color="#79573f" />
                            </TouchableOpacity>
                            <View style={styles.greetingArea}>
                                <Text style={styles.brandText}>PetCare</Text>
                                <Text style={styles.greetingText}>Hi there 👋</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('UserProfile')}>
                            <MaterialIcons name="list" size={24} color="#30628a" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.headerBottomRow}>
                        <Text style={styles.pageTitle}>My Pets</Text>
                        <Text style={styles.petCount}>{pets.length} {pets.length === 1 ? 'pal' : 'pals'}</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentArea}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#30628a" style={{ marginTop: 60 }} />
                    ) : pets.length === 0 ? (
                        /* Empty State */
                        <View style={styles.emptyStateContainer}>
                            <View style={styles.lottieWrapper}>
                                <BeagleLottie type="empty" />
                            </View>
                            <Text style={styles.emptyTextTitle}>No pets yet</Text>
                            <Text style={styles.emptyTextSub}>
                                You haven't added any furry friends yet.{'\n'}Let's get started!
                            </Text>
                            <TouchableOpacity
                                style={styles.addPetBtn}
                                activeOpacity={0.85}
                                onPress={() => navigation.navigate('AddPet')}
                            >
                                <MaterialIcons name="add-circle" size={22} color="#ffffff" />
                                <Text style={styles.addPetBtnText}>Add Your First Pet</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        /* Pet List */
                        <>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Your furry family</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
                                    <Text style={styles.seeAll}>See all</Text>
                                </TouchableOpacity>
                            </View>

                            {pets.slice(0, 3).map((pet, i) => (
                                <PetCard
                                    key={pet._id}
                                    pet={pet}
                                    index={i}
                                    onPress={() => navigation.navigate('PetDetail', { petId: pet._id })}
                                />
                            ))}

                            {pets.length > 3 && (
                                <TouchableOpacity style={styles.viewMoreBtn} onPress={() => navigation.navigate('UserProfile')}>
                                    <Text style={styles.viewMoreText}>View all {pets.length} pets</Text>
                                    <MaterialIcons name="arrow-forward" size={16} color="#30628a" />
                                </TouchableOpacity>
                            )}
                        </>
                    )}

                    {/* Bento Cards */}
                    <View style={styles.bentoGrid}>
                        <TouchableOpacity
                            style={[styles.bentoCard, styles.bentoCardPrimary]}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('AddPet')}
                        >
                            <View style={styles.bentoContent}>
                                <Text style={styles.bentoTitlePrimary}>Add a Pet</Text>
                                <Text style={styles.bentoSubPrimary}>Register a new furry friend to your profile and track their health.</Text>
                            </View>
                            <View style={styles.bentoActionPrimary}>
                                <Text style={styles.bentoActionTextPrimary}>Get Started</Text>
                                <MaterialIcons name="arrow-forward" size={16} color="#30628a" />
                            </View>
                            <MaterialIcons name="pets" size={100} color="rgba(48,98,138,0.05)" style={styles.bentoBgIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.bentoCard, styles.bentoCardSecondary]}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('Social')}
                        >
                            <View style={styles.bentoContent}>
                                <Text style={styles.bentoTitleSecondary}>Social Feed</Text>
                                <Text style={styles.bentoSubSecondary}>Connect with other pet parents and share your pet moments.</Text>
                            </View>
                            <View style={styles.bentoActionSecondary}>
                                <Text style={styles.bentoActionTextSecondary}>Join the Feed</Text>
                                <MaterialIcons name="groups" size={16} color="#7a5840" />
                            </View>
                            <MaterialIcons name="forum" size={100} color="rgba(122,88,64,0.05)" style={styles.bentoBgIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* FAB */}
            {pets.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('AddPet')}
                >
                    <MaterialIcons name="add" size={28} color="#ffffff" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    scrollContent: { flexGrow: 1, paddingBottom: 120 },
    headerWrapper: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
        paddingHorizontal: 28, paddingTop: 50, paddingBottom: 30,
        overflow: 'hidden',
    },
    glowTopRight: { position: 'absolute', top: -40, right: -40, width: 150, height: 150, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 75 },
    glowMidLeft: { position: 'absolute', top: 60, left: -30, width: 120, height: 120, backgroundColor: 'rgba(121,87,63,0.1)', borderRadius: 60 },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, zIndex: 10 },
    userInfoArea: { flexDirection: 'row', alignItems: 'center' },
    profileBtn: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.4)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
    },
    greetingArea: { justifyContent: 'center' },
    brandText: { fontSize: 22, fontWeight: 'bold', color: '#79573f' },
    greetingText: { fontSize: 12, color: '#275b82', opacity: 0.9 },
    iconBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerBottomRow: { zIndex: 10, flexDirection: 'row', alignItems: 'baseline', gap: 10 },
    pageTitle: { fontSize: 30, fontWeight: '800', color: '#79573f' },
    petCount: { fontSize: 14, color: '#30628a', fontWeight: '600' },
    contentArea: { paddingHorizontal: 20, paddingTop: 24 },
    // Empty state
    emptyStateContainer: { alignItems: 'center', marginBottom: 32 },
    lottieWrapper: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
    emptyTextTitle: { fontSize: 20, fontWeight: 'bold', color: '#79573f', marginTop: 10, marginBottom: 8 },
    emptyTextSub: { fontSize: 14, color: '#41474e', textAlign: 'center', paddingHorizontal: 30, marginBottom: 20, lineHeight: 21 },
    addPetBtn: {
        backgroundColor: '#30628a', paddingVertical: 14, paddingHorizontal: 24,
        borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 8,
        shadowColor: '#30628a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    addPetBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
    // Pet list
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#79573f' },
    seeAll: { fontSize: 13, color: '#30628a', fontWeight: '600' },
    petCard: {
        backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12,
        borderWidth: 1, borderColor: '#efe8d5',
        shadowColor: 'rgba(111,78,55,0.04)', shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: 1, elevation: 1,
    },
    petAvatar: { width: 58, height: 58, borderRadius: 29 },
    petAvatarPlaceholder: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
    petCardInfo: { flex: 1 },
    petCardName: { fontSize: 17, fontWeight: 'bold', color: '#79573f' },
    petCardBreed: { fontSize: 13, color: '#41474e', marginTop: 2, textTransform: 'capitalize' },
    petCardAge: { fontSize: 12, color: '#72787f', marginTop: 2 },
    petCardRight: { alignItems: 'flex-end' },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(162,210,255,0.3)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    },
    badgeText: { fontSize: 10, color: '#30628a', fontWeight: 'bold' },
    viewMoreBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: 12, marginBottom: 20,
    },
    viewMoreText: { color: '#30628a', fontWeight: '600', fontSize: 14 },
    // Bento
    bentoGrid: { marginTop: 16 },
    bentoCard: { borderRadius: 16, padding: 24, minHeight: 150, marginBottom: 16, overflow: 'hidden', justifyContent: 'space-between' },
    bentoCardPrimary: { backgroundColor: '#faf3e0' },
    bentoCardSecondary: { backgroundColor: '#ffd1b3' },
    bentoContent: { zIndex: 10 },
    bentoTitlePrimary: { fontSize: 18, fontWeight: 'bold', color: '#79573f', marginBottom: 6 },
    bentoSubPrimary: { fontSize: 13, color: '#41474e', lineHeight: 19 },
    bentoActionPrimary: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 6, zIndex: 10 },
    bentoActionTextPrimary: { color: '#30628a', fontWeight: 'bold', fontSize: 13 },
    bentoTitleSecondary: { fontSize: 18, fontWeight: 'bold', color: '#7a5840', marginBottom: 6 },
    bentoSubSecondary: { fontSize: 13, color: 'rgba(122,88,64,0.8)', lineHeight: 19 },
    bentoActionSecondary: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 6, zIndex: 10 },
    bentoActionTextSecondary: { color: '#7a5840', fontWeight: 'bold', fontSize: 13 },
    bentoBgIcon: { position: 'absolute', bottom: -20, right: -20, zIndex: 1 },
    // FAB
    fab: {
        position: 'absolute', bottom: 100, right: 24,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#D4A017',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#D4A017', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
    },
});
