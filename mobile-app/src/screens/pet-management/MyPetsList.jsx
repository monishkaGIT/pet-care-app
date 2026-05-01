import React, { useCallback, useState } from 'react';
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
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchUserPets } from '../../api/petApi';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

const PET_COLORS = [
  { bg: 'rgba(162,210,255,0.35)', icon: '#30628a' },
  { bg: 'rgba(255,209,179,0.4)', icon: '#79573f' },
  { bg: 'rgba(255,192,146,0.4)', icon: '#8e4e14' },
  { bg: 'rgba(162,210,255,0.2)', icon: '#275b82' },
  { bg: '#faf3e0', icon: '#79573f' },
];

function PetRow({ pet, index, onPress }) {
  const scheme = PET_COLORS[index % PET_COLORS.length];

  return (
    <TouchableOpacity style={styles.petCard} onPress={onPress} activeOpacity={0.85}>
      {pet.profileImage ? (
        <Image source={{ uri: pet.profileImage }} style={styles.petAvatar} />
      ) : (
        <View style={[styles.petAvatarPlaceholder, { backgroundColor: scheme.bg }]}>
          <MaterialIcons name="pets" size={28} color={scheme.icon} />
        </View>
      )}

      <View style={styles.petInfo}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petBreed}>{pet.breed || pet.type || 'Unknown breed'}</Text>
        <Text style={styles.petMeta}>
          {pet.age > 0 ? `${pet.age} yr${pet.age !== 1 ? 's' : ''} old` : 'Age unknown'}
          {pet.weight > 0 ? ` · ${pet.weight} kg` : ''}
        </Text>
      </View>

      <MaterialIcons name="chevron-right" size={24} color="#72787f" />
    </TouchableOpacity>
  );
}

export default function MyPetsList() {
  const navigation = useNavigation();
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
            <View style={styles.header}>
              <View style={styles.headerTopRow}>
                <View>
                  <Text style={styles.brand}>PetCare</Text>
                  <Text style={styles.title}>MyPets</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('UserProfile')} activeOpacity={0.8}>
                  <MaterialIcons name="person" size={22} color="#30628a" />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>Your furry family</Text>
              <Text style={styles.helperText}>Keep track of your beloved pets' health and activities.</Text>
            </View>

            <View style={styles.quickInsightRow}>
              <View style={[styles.insightCard, styles.insightCardWarm]}>
                <MaterialIcons name="vaccines" size={20} color="#30628a" />
                <Text style={styles.insightLabel}>Upcoming</Text>
                <Text style={styles.insightValue}>Vaccination (2d)</Text>
              </View>
              <View style={[styles.insightCard, styles.insightCardCool]}>
                <MaterialIcons name="schedule" size={20} color="#30628a" />
                <Text style={styles.insightLabel}>Next Walk</Text>
                <Text style={styles.insightValue}>6:30 PM Today</Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#30628a" />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="pets" size={64} color="rgba(162,210,255,0.5)" />
              <Text style={styles.emptyTitle}>No pets yet</Text>
              <Text style={styles.emptyText}>Add your first pet to start tracking their profile, health, and activities.</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddPet')} activeOpacity={0.85}>
                <MaterialIcons name="add-circle" size={20} color="#ffffff" />
                <Text style={styles.addBtnText}>Add Your First Pet</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item, index }) => (
          <PetRow pet={item} index={index} onPress={() => navigation.navigate('PetDetail', { petId: item._id })} />
        )}
        ListFooterComponent={
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.primaryAction} onPress={() => navigation.navigate('AddPet')} activeOpacity={0.9}>
              <View>
                <Text style={styles.primaryActionTitle}>Add a Pet</Text>
                <Text style={styles.primaryActionSub}>Register a new furry friend to your profile.</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={18} color="#30628a" />
            </TouchableOpacity>

          </View>
        }
        ListHeaderComponentStyle={styles.listHeader}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddPet')} activeOpacity={0.85}>
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff9ec' },
  content: { paddingBottom: 120, paddingHorizontal: 20 },
  listHeader: { paddingBottom: 8 },
  header: {
    backgroundColor: '#a2d2ff',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 18,
    paddingBottom: 24,
    marginHorizontal: -20,
    marginBottom: 16,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  brand: { fontSize: 22, fontWeight: '800', color: '#79573f' },
  title: { fontSize: 34, fontWeight: '900', color: '#30628a', marginTop: 2 },
  profileBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: { fontSize: 18, fontWeight: '700', color: '#79573f', marginBottom: 4 },
  helperText: { fontSize: 13, color: '#41474e', lineHeight: 19 },
  quickInsightRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  insightCard: {
    flex: 1,
    minHeight: 120,
    borderRadius: 18,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#efe8d5',
  },
  insightCardWarm: { backgroundColor: '#faf3e0' },
  insightCardCool: { backgroundColor: 'rgba(162,210,255,0.18)' },
  insightLabel: { fontSize: 11, fontWeight: '700', color: '#41474e', textTransform: 'uppercase', letterSpacing: 1 },
  insightValue: { fontSize: 15, fontWeight: '700', color: '#79573f', marginTop: 4 },
  petCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#efe8d5',
    shadowColor: 'rgba(111,78,55,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 1,
  },
  petAvatar: { width: 60, height: 60, borderRadius: 30 },
  petAvatarPlaceholder: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  petInfo: { flex: 1 },
  petName: { fontSize: 17, fontWeight: '800', color: '#79573f' },
  petBreed: { fontSize: 13, color: '#41474e', marginTop: 2, textTransform: 'capitalize' },
  petMeta: { fontSize: 12, color: '#72787f', marginTop: 2 },
  loadingWrap: { paddingVertical: 60 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 10,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#79573f', marginTop: 10, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#41474e', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20, marginBottom: 18 },
  addBtn: {
    backgroundColor: '#30628a',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  footerActions: { marginTop: 8, gap: 12 },
  primaryAction: {
    backgroundColor: '#faf3e0',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryActionTitle: { fontSize: 16, fontWeight: '800', color: '#79573f' },
  primaryActionSub: { fontSize: 13, color: '#41474e', marginTop: 4, maxWidth: 250 },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4A017',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4A017',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});