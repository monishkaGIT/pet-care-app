import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    ScrollView, ActivityIndicator, RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchUserPets } from '../../api/petApi';

function AskPawlyShortcut({ onPress, small }) {
    return (
        <TouchableOpacity style={small ? styles.askPawlyWrapSmall : styles.askPawlyWrap} onPress={onPress} activeOpacity={0.85}>
            <View style={small ? styles.askPawlyCircleSmall : styles.askPawlyCircle}>
                <MaterialCommunityIcons name="dog" size={small ? 28 : 38} color="#e0ad00" />
            </View>
            <Text style={small ? styles.askPawlyLabelSmall : styles.askPawlyLabel}>Ask Pawly?</Text>
        </TouchableOpacity>
    );
}

export default function HomeScreen() {
    const navigation = useNavigation();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPets = async () => {
        try {
            const data = await fetchUserPets();
            setPets(data);
        } catch (e) {
            console.error('Failed to load pets', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadPets();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadPets();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.secondary} />
            </View>
        );
    }

    // ─── EMPTY STATE (Image 1) ─────────────────────────────
    if (pets.length === 0) {
        return (
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
                            <Ionicons name="person-circle-outline" size={36} color={COLORS.secondary} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerBrand}>PetCare</Text>
                            <Text style={styles.headerSubtitle}>Welcome back to PetCare!</Text>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="notifications" size={24} color={COLORS.secondary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerTitle}>My Pets</Text>
                </View>

                {/* Empty Illustration */}
                <View style={styles.emptyBody}>
                    <View style={styles.emptyCircle}>
                        <MaterialCommunityIcons name="paw" size={60} color="#b8a99a" />
                        <View style={styles.emptyPlusBtn}>
                            <Ionicons name="add" size={18} color="#fff" />
                        </View>
                    </View>

                    <Text style={styles.emptyTitle}>Zzz… No data available</Text>
                    <Text style={styles.emptyDesc}>
                        It looks like you haven't added any{'\n'}furry friends yet. Let's get started!
                    </Text>

                    <TouchableOpacity
                        style={styles.addFirstBtn}
                        onPress={() => navigation.navigate('AddPet')}
                    >
                        <Ionicons name="add-circle" size={20} color="#fff" />
                        <Text style={styles.addFirstBtnText}>Add Your First Pet</Text>
                    </TouchableOpacity>

                    <AskPawlyShortcut onPress={() => navigation.navigate('AskPawly')} />

                    {/* Info Cards */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardInner}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoCardTitle}>Pet Health Check</Text>
                                <Text style={styles.infoCardDesc}>
                                    Keep track of vaccinations and{'\n'}upcoming vet appointments easily.
                                </Text>
                                <TouchableOpacity style={styles.learnMoreBtn}>
                                    <Text style={styles.learnMoreText}>Learn More →</Text>
                                </TouchableOpacity>
                            </View>
                            <MaterialCommunityIcons name="medical-bag" size={44} color="rgba(162,210,255,0.5)" />
                        </View>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: '#fde8d8' }]}>
                        <View style={styles.infoCardInner}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoCardTitle}>Social Community</Text>
                                <Text style={styles.infoCardDesc}>
                                    Connect with other pet parents in{'\n'}your neighborhood.
                                </Text>
                                <TouchableOpacity style={styles.learnMoreBtn}>
                                    <Text style={[styles.learnMoreText, { color: COLORS.secondary }]}>Join Group 🐾</Text>
                                </TouchableOpacity>
                            </View>
                            <MaterialCommunityIcons name="account-group" size={44} color="rgba(111,78,55,0.25)" />
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    }

    // ─── PET LIST STATE (Image 3) ──────────────────────────
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerList}>
                <View>
                    <Text style={styles.headerBrand}>PetCare</Text>
                    <Text style={styles.headerTitleList}>MyPets</Text>
                </View>
                <TouchableOpacity style={styles.profileBtnList} onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={pets}
                keyExtractor={(item) => item._id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.secondary]} />}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 }}
                ListHeaderComponent={() => (
                    <View style={styles.listHeaderRow}>
                        <View style={{ flex: 1, paddingRight: 15 }}>
                            <Text style={styles.familyTitle}>Your furry family</Text>
                            <Text style={styles.familyDesc}>Keep track of your beloved pets' health and activities.</Text>
                        </View>
                    </View>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.petCard}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('PetDetail', { petId: item._id })}
                    >
                        <View style={styles.petCardIcon}>
                            <MaterialCommunityIcons name="paw" size={28} color={COLORS.secondary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={styles.petCardName}>{item.name}</Text>
                            <Text style={styles.petCardBreed}>{item.breed}</Text>
                            <Text style={styles.petCardAge}>{item.age} years old</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color="#ccc" />
                    </TouchableOpacity>
                )}
                ListFooterComponent={() => (
                    <View style={styles.insightsSection}>
                        <Text style={styles.insightsTitle}>Quick Insights</Text>
                        <View style={styles.insightsRow}>
                            <View style={styles.insightCard}>
                                <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={COLORS.secondary} />
                                <Text style={styles.insightLabel}>UPCOMING</Text>
                                <Text style={styles.insightValue}>Vaccination (2d)</Text>
                            </View>
                            <View style={[styles.insightCard, { backgroundColor: COLORS.primary }]}>
                                <MaterialCommunityIcons name="walk" size={24} color={COLORS.secondary} />
                                <Text style={[styles.insightLabel, { color: COLORS.secondary }]}>NEXT WALK</Text>
                                <Text style={[styles.insightValue, { color: COLORS.secondary }]}>6:30 PM Today</Text>
                            </View>
                        </View>
                    </View>
                )}
            />

            {/* Ask Pawly Floating Button */}
            <View style={styles.askPawlyFab}>
                <AskPawlyShortcut small onPress={() => navigation.navigate('AskPawly')} />
            </View>

            {/* FAB Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddPet')}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.lightGray },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.lightGray },

    // ── Empty State Header ──
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...SHADOWS.header,
    },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    profileBtn: { marginRight: 10 },
    headerBrand: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
    headerSubtitle: { fontSize: 12, color: COLORS.secondary, opacity: 0.8 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.secondary },

    // ── Empty Body ──
    emptyBody: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 40 },
    emptyCircle: {
        width: 130, height: 130, borderRadius: 65,
        backgroundColor: '#ede7e0', justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
    },
    emptyPlusBtn: {
        position: 'absolute', bottom: 8, right: 8,
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center',
        elevation: 3,
    },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8, textAlign: 'center' },
    emptyDesc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    addFirstBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.secondary, paddingVertical: 14, paddingHorizontal: 28,
        borderRadius: 30, marginBottom: 30, ...SHADOWS.button,
    },
    addFirstBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

    askPawlyWrap: {
        alignItems: 'center',
        marginBottom: 22,
    },
    askPawlyCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#f7f3de',
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.card,
    },
    askPawlyLabel: {
        marginTop: 10,
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.textMuted,
    },
    askPawlyWrapSmall: {
        alignItems: 'center',
    },
    askPawlyCircleSmall: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f7f3de',
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.card,
    },
    askPawlyLabelSmall: {
        marginTop: 6,
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textMuted,
    },

    // ── Info Cards ──
    infoCard: {
        width: '100%', backgroundColor: '#dbeafe', borderRadius: 18,
        padding: 20, marginBottom: 16,
    },
    infoCardInner: { flexDirection: 'row', alignItems: 'center' },
    infoCardTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
    infoCardDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18, marginBottom: 10 },
    learnMoreBtn: {},
    learnMoreText: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },

    // ── List State Header ──
    headerList: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20, paddingTop: 50, paddingBottom: 22,
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
        ...SHADOWS.header,
    },
    headerTitleList: { fontSize: 28, fontWeight: 'bold', color: COLORS.secondary },
    profileBtnList: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center',
    },

    // ── Pet List ──
    listHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    familyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.secondary, marginTop: 10 },
    familyDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, marginBottom: 10 },

    petCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.surface, borderRadius: 16,
        padding: 16, marginBottom: 12,
        ...SHADOWS.card,
    },
    petCardIcon: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#ede7e0', justifyContent: 'center', alignItems: 'center',
    },
    petCardName: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary },
    petCardBreed: { fontSize: 13, color: COLORS.secondary, marginTop: 1 },
    petCardAge: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

    // ── Quick Insights ──
    insightsSection: { marginTop: 14 },
    insightsTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 10 },
    insightsRow: { flexDirection: 'row', gap: 12 },
    insightCard: {
        flex: 1, backgroundColor: COLORS.surface, borderRadius: 16,
        padding: 14, ...SHADOWS.card,
    },
    insightLabel: { fontSize: 10, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 8, letterSpacing: 0.5 },
    insightValue: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginTop: 2 },

    // ── FAB ──
    askPawlyFab: {
        position: 'absolute',
        bottom: 20,
        right: 18,
        alignItems: 'center',
        zIndex: 10,
    },
    fab: {
        position: 'absolute', bottom: 120, right: 20,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center',
        elevation: 6,
        shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4, shadowRadius: 5,
    },
});
