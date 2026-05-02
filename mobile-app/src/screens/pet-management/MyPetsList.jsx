import React, { useCallback, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchUserPets } from '../../api/petApi';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';
import { AuthContext } from '../../context/AuthContext';

const { width: SCREEN_W } = Dimensions.get('window');

const PET_COLORS = [
  { bg: 'rgba(162,210,255,0.30)', accent: '#30628a', ring: 'rgba(48,98,138,0.18)' },
  { bg: 'rgba(255,209,179,0.35)', accent: '#79573f', ring: 'rgba(121,87,63,0.18)' },
  { bg: 'rgba(255,192,146,0.35)', accent: '#8e4e14', ring: 'rgba(142,78,20,0.18)' },
  { bg: 'rgba(162,210,255,0.20)', accent: '#275b82', ring: 'rgba(39,91,130,0.15)' },
  { bg: '#faf3e0', accent: '#79573f', ring: 'rgba(121,87,63,0.12)' },
];

// ─── Pet Card ─────────────────────────────────────────────────────────────────

function PetCard({ pet, index, onPress }) {
  const scheme = PET_COLORS[index % PET_COLORS.length];
  const vaccinated = pet.isVaccinated;

  return (
    <TouchableOpacity style={styles.petCard} onPress={onPress} activeOpacity={0.88}>
      {/* Avatar */}
      <View style={[styles.petAvatarWrap, { borderColor: scheme.ring }]}>
        {pet.profileImage ? (
          <Image source={{ uri: pet.profileImage }} style={styles.petAvatar} />
        ) : (
          <View style={[styles.petAvatarPlaceholder, { backgroundColor: scheme.bg }]}>
            <MaterialIcons name="pets" size={26} color={scheme.accent} />
          </View>
        )}
        {vaccinated && (
          <View style={styles.petBadge}>
            <MaterialIcons name="verified" size={14} color="#22c55e" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.petInfo}>
        <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
        <Text style={styles.petBreed} numberOfLines={1}>{pet.breed || pet.type || 'Unknown breed'}</Text>
        <View style={styles.petMetaRow}>
          {pet.age > 0 && (
            <View style={styles.metaTag}>
              <MaterialIcons name="cake" size={12} color="#79573f" />
              <Text style={styles.metaTagText}>{pet.age} yr{pet.age !== 1 ? 's' : ''}</Text>
            </View>
          )}
          {pet.weight > 0 && (
            <View style={styles.metaTag}>
              <MaterialIcons name="fitness-center" size={12} color="#79573f" />
              <Text style={styles.metaTagText}>{pet.weight} kg</Text>
            </View>
          )}
          {pet.gender && (
            <View style={styles.metaTag}>
              <MaterialIcons name={pet.gender === 'Female' ? 'female' : 'male'} size={12} color="#79573f" />
              <Text style={styles.metaTagText}>{pet.gender}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Arrow */}
      <View style={styles.petArrow}>
        <MaterialIcons name="chevron-right" size={22} color="#b0a898" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MyPetsList() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalProps, showModal] = usePetCareModal();

  const loadPets = useCallback(async () => {
    try {
      const data = await fetchUserPets();
      setPets(data);
    } catch (error) {
      showModal('error', 'Error', 'Could not load pets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPets();
    }, [loadPets])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPets();
  };

  const totalPets = pets.length;
  const vaccinatedCount = pets.filter(p => p.isVaccinated).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <PetCareModal {...modalProps} />
      <FlatList
        data={pets}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#30628a" />}
        ListHeaderComponent={
          <>
            {/* ── Hero Header ─────────────────────────────────────── */}
            <View style={styles.hero}>
              {/* Decorative circles */}
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />

              {/* Top bar */}
              <View style={styles.heroTopBar}>
                <View style={styles.heroLeftCol}>
                  <Text style={styles.heroBrand}>PetCare</Text>
                  <Text style={styles.heroGreeting}>Hi there 👋</Text>
                </View>
                <TouchableOpacity
                  style={styles.profileBtn}
                  onPress={() => navigation.navigate('UserProfile')}
                  activeOpacity={0.8}
                >
                  {user?.profileImage ? (
                    <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
                  ) : (
                    <MaterialIcons name="person" size={22} color="#30628a" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Title Row */}
              <View style={styles.heroTitleRow}>
                <Text style={styles.heroTitle}>My Pets</Text>
                {totalPets > 0 && (
                  <Text style={styles.heroPalCount}>{totalPets} pal{totalPets !== 1 ? 's' : ''}</Text>
                )}
              </View>
            </View>

            {/* ── Section Label ────────────────────────────────────── */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Your furry family</Text>
              {totalPets > 0 && (
                <Text style={styles.sectionCount}>{totalPets} pet{totalPets !== 1 ? 's' : ''}</Text>
              )}
            </View>

            {/* ── Quick Stats ──────────────────────────────────────── */}
            {totalPets > 0 && (
              <View style={styles.statsRow}>
                <View style={[styles.statCard, styles.statCardWarm]}>
                  <View style={styles.statIconWrap}>
                    <MaterialIcons name="pets" size={20} color="#79573f" />
                  </View>
                  <Text style={styles.statNumber}>{totalPets}</Text>
                  <Text style={styles.statLabel}>Total Pets</Text>
                </View>
                <View style={[styles.statCard, styles.statCardCool]}>
                  <View style={[styles.statIconWrap, { backgroundColor: 'rgba(162,210,255,0.35)' }]}>
                    <MaterialIcons name="vaccines" size={20} color="#30628a" />
                  </View>
                  <Text style={styles.statNumber}>{vaccinatedCount}</Text>
                  <Text style={styles.statLabel}>Vaccinated</Text>
                </View>
                <View style={[styles.statCard, styles.statCardAccent]}>
                  <View style={[styles.statIconWrap, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
                    <MaterialIcons name="favorite" size={20} color="#22c55e" />
                  </View>
                  <Text style={styles.statNumber}>{totalPets}</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#30628a" />
              <Text style={styles.loadingText}>Loading your pets...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <MaterialIcons name="pets" size={52} color="rgba(162,210,255,0.6)" />
              </View>
              <Text style={styles.emptyTitle}>No pets yet</Text>
              <Text style={styles.emptyText}>
                Add your first pet to start tracking their profile, health, and activities.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => navigation.navigate('AddPet')}
                activeOpacity={0.85}
              >
                <MaterialIcons name="add-circle" size={20} color="#ffffff" />
                <Text style={styles.emptyAddBtnText}>Add Your First Pet</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <PetCard
            pet={item}
            index={index}
            onPress={() => navigation.navigate('PetDetail', { petId: item._id })}
          />
        )}
        ListFooterComponent={
          totalPets > 0 ? (
            <TouchableOpacity
              style={styles.addPetRow}
              onPress={() => navigation.navigate('AddPet')}
              activeOpacity={0.88}
            >
              <View style={styles.addPetIcon}>
                <MaterialIcons name="add" size={22} color="#30628a" />
              </View>
              <View style={styles.addPetInfo}>
                <Text style={styles.addPetTitle}>Add another pet</Text>
                <Text style={styles.addPetSub}>Register a new furry friend</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={14} color="#b0a898" />
            </TouchableOpacity>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      {/* ── FAB ────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPet')}
        activeOpacity={0.88}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff9ec',
  },
  content: {
    paddingBottom: 120,
  },

  // ── Hero ──
  hero: {
    backgroundColor: '#a2d2ff',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 12 : 18,
    paddingBottom: 36,
    overflow: 'hidden',
    position: 'relative',
  },
  heroCircle1: {
    position: 'absolute',
    top: -30,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroCircle2: {
    position: 'absolute',
    top: 40,
    right: 30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroLeftCol: {},
  heroBrand: {
    fontSize: 22,
    fontWeight: '800',
    color: '#79573f',
  },
  heroGreeting: {
    fontSize: 14,
    color: '#275b82',
    fontWeight: '600',
    marginTop: 2,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  heroTitleRow: {
    alignItems: 'center',
    width: '100%',
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#1b3d5e',
    lineHeight: 42,
    textAlign: 'center',
  },
  heroPalCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3a6d94',
    marginTop: 4,
    textAlign: 'center',
  },

  // ── Section Label ──
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#79573f',
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#72787f',
  },

  // ── Stats Row ──
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#efe8d5',
    shadowColor: 'rgba(111,78,55,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 1,
  },
  statCardWarm: { backgroundColor: '#fff9ec' },
  statCardCool: { backgroundColor: 'rgba(162,210,255,0.08)' },
  statCardAccent: { backgroundColor: '#ffffff' },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#faf3e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e1c10',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#72787f',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },

  // ── Pet Card ──
  petCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#efe8d5',
    shadowColor: 'rgba(111,78,55,0.06)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  petAvatarWrap: {
    position: 'relative',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  petAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#efe8d5',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e1c10',
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 13,
    color: '#41474e',
    textTransform: 'capitalize',
    fontWeight: '500',
    marginBottom: 6,
  },
  petMetaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#faf3e0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#79573f',
  },
  petArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#faf3e0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Loading ──
  loadingWrap: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#72787f',
    fontWeight: '500',
  },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(162,210,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(162,210,255,0.25)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#79573f',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#41474e',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    fontWeight: '500',
  },
  emptyAddBtn: {
    backgroundColor: '#30628a',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#30628a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyAddBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },

  // ── Add Pet Row (Footer) ──
  addPetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    marginTop: 4,
    backgroundColor: '#faf3e0',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#efe8d5',
    borderStyle: 'dashed',
  },
  addPetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(162,210,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPetInfo: {
    flex: 1,
  },
  addPetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#30628a',
  },
  addPetSub: {
    fontSize: 12,
    color: '#72787f',
    marginTop: 2,
    fontWeight: '500',
  },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#30628a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#30628a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 3,
    borderColor: 'rgba(162,210,255,0.4)',
  },
});