import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
    ActivityIndicator, RefreshControl, Image, Platform, StatusBar
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchServices } from '../../api/serviceApi';
import { fetchBookings } from '../../api/bookingApi';
import { NotificationsContext } from '../../context/NotificationsContext';
import { AuthContext } from '../../context/AuthContext';

// Map category names to MaterialCommunityIcons
const CATEGORY_ICONS = {
    'Grooming': 'content-cut',
    'Boarding': 'home-heart',
    'Walking': 'walk',
    'Training': 'school-outline',
    'Medical Care': 'medical-bag',
};

// Category color palette for cards without images
const CATEGORY_COLORS = {
    'Grooming': { color: '#a2d2ff', bgColor: '#eaf4ff' },
    'Boarding': { color: '#ffc092', bgColor: '#fff3e8' },
    'Walking': { color: '#b8d8a8', bgColor: '#edf7e7' },
    'Training': { color: '#f0c0c0', bgColor: '#fef0f0' },
    'Medical Care': { color: '#c5b3e6', bgColor: '#f3eeff' },
};

const DEFAULT_CATEGORY_COLOR = { color: '#a2d2ff', bgColor: '#eaf4ff' };

export default function ServicesScreen() {
    const navigation = useNavigation();
    const { unread } = useContext(NotificationsContext);
    const { user } = useContext(AuthContext);
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    const loadServices = useCallback(async () => {
        try {
            const data = await fetchServices();
            // Only show active services to regular users
            setServices(data.filter((s) => s.isActive));
        } catch (error) {
            console.error('Failed to load services:', error?.response?.data?.message || error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const loadBookings = useCallback(async () => {
        try {
            const data = await fetchBookings();
            setBookings(data);
        } catch (e) {
            // silently ignore
        }
    }, []);

    // Refetch when the screen comes into focus (e.g. after admin adds a new service)
    useFocusEffect(
        useCallback(() => {
            loadServices();
            loadBookings();
        }, [loadServices, loadBookings])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadServices();
        loadBookings();
    };

    const showNotifications = () => {
        navigation.navigate('Notifications');
    };

    // Filter services by search text
    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchText.toLowerCase()) ||
        s.category.toLowerCase().includes(searchText.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(searchText.toLowerCase())
    );

    // Group services by category for display
    const categories = [...new Set(filteredServices.map(s => s.category))];

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('UserProfile')}>
                        {user?.profileImage ? (
                            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
                        ) : (
                            <Ionicons name="person-circle-outline" size={36} color="#fff" />
                        )}
                    </TouchableOpacity>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.headerBrand}>PetCare</Text>
                        <Text style={styles.headerTitle}>Services</Text>
                    </View>
                    <TouchableOpacity onPress={showNotifications}>
                        <View>
                            <Ionicons name="notifications" size={24} color="#fff" />
                            {unread > 0 && (
                                <View style={styles.notifBadge}>
                                    <Text style={styles.notifBadgeText}>{unread > 99 ? '99+' : unread}</Text>
                                </View>
                            )}
                        </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color={COLORS.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Find the best care..."
                            placeholderTextColor={COLORS.textPlaceholder}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')}>
                                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Content */}
                <View style={styles.cardsContainer}>
                    {loading ? (
                        <View style={styles.loadingState}>
                            <ActivityIndicator size="large" color={COLORS.secondary} />
                            <Text style={styles.loadingText}>Loading services...</Text>
                        </View>
                    ) : filteredServices.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="magnify-close" size={48} color={COLORS.textMuted} />
                            <Text style={styles.emptyTitle}>
                                {searchText ? 'No matching services' : 'No services available'}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {searchText
                                    ? 'Try a different search term.'
                                    : 'Check back later for new pet care offerings.'}
                            </Text>
                        </View>
                    ) : (
                        filteredServices.map((service) => {
                            const catColors = CATEGORY_COLORS[service.category] || DEFAULT_CATEGORY_COLOR;
                            const iconName = CATEGORY_ICONS[service.category] || 'paw';

                            return (
                                <View key={service._id} style={[styles.serviceCard, { backgroundColor: catColors.bgColor }]}>
                                    {/* Service Image (if available from admin) */}
                                    {service.imageUrl ? (
                                        <Image
                                            source={{ uri: service.imageUrl }}
                                            style={styles.serviceImage}
                                            resizeMode="cover"
                                        />
                                    ) : null}

                                    <View style={styles.serviceCardBody}>
                                        <View style={[styles.serviceIconCircle, { backgroundColor: catColors.color }]}>
                                            <MaterialCommunityIcons name={iconName} size={28} color="#fff" />
                                        </View>

                                        {/* Category badge */}
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryBadgeText}>{service.category}</Text>
                                        </View>

                                        <Text style={styles.serviceType}>{service.name}</Text>
                                        <Text style={styles.serviceDesc} numberOfLines={3}>{service.description}</Text>

                                        {/* Price */}
                                        <View style={styles.priceRow}>
                                            <Text style={styles.priceText}>Rs. {service.price?.toFixed(2)}</Text>
                                            <Text style={styles.priceLabel}> / session</Text>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.serviceCta}
                                            onPress={() => navigation.navigate('BookAService', {
                                                serviceType: service.category,
                                                serviceName: service.name,
                                                serviceId: service._id,
                                            })}
                                        >
                                            <Text style={styles.serviceCtaText}>Book Now  →</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* My Bookings Button */}
                <TouchableOpacity
                    style={styles.myBookingsBtn}
                    onPress={() => navigation.navigate('MyBookings')}
                >
                    <Ionicons name="calendar" size={20} color="#fff" />
                    <Text style={styles.myBookingsBtnText}>View My Bookings</Text>
                </TouchableOpacity>


                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // ── Header ──
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 50,
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...SHADOWS.header,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    headerBrand: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        fontStyle: 'italic',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },

    // ── Search ──
    searchContainer: {
        alignItems: 'center',
        marginTop: -18,
        paddingHorizontal: 30,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
        width: '100%',
        ...SHADOWS.card,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.textPrimary,
    },

    // ── Service Cards ──
    cardsContainer: {
        paddingHorizontal: 24,
        marginTop: 20,
    },
    serviceCard: {
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        ...SHADOWS.card,
    },
    serviceImage: {
        width: '100%',
        height: 150,
    },
    serviceCardBody: {
        padding: 22,
    },
    serviceIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.06)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        marginBottom: 10,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    serviceType: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    serviceDesc: {
        fontSize: 13,
        color: COLORS.textMuted,
        lineHeight: 19,
        marginBottom: 14,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 14,
    },
    priceText: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    priceLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.textMuted,
    },
    serviceCta: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.secondary,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    serviceCtaText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },

    // ── Loading & Empty ──
    loadingState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 6,
        textAlign: 'center',
    },

    // ── My Bookings Button ──
    myBookingsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.secondary,
        marginHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 25,
        marginTop: 6,
        marginBottom: 20,
        ...SHADOWS.button,
    },
    myBookingsBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8,
    },

    // ── Membership Banner ──
    membershipBanner: {
        backgroundColor: COLORS.primary,
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
    },
    membershipTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    membershipDesc: {
        fontSize: 13,
        color: '#c7d9ea',
        textAlign: 'center',
        lineHeight: 19,
        marginBottom: 16,
    },
    learnMoreBtn: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 20,
    },
    learnMoreText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },

    // ── Notification Badge ──
    notifBadge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: '#dc2626',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notifBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
    },
});
