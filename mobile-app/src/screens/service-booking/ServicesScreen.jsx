import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';

const SERVICES = [
    {
        type: 'Grooming',
        icon: 'content-cut',
        description: 'Luxury spa treatments, breed-specific cuts, and deep cleaning for your companion\'s best look.',
        cta: 'View Stylists',
        color: '#a2d2ff',
        bgColor: '#eaf4ff',
    },
    {
        type: 'Boarding',
        icon: 'home-heart',
        description: 'A home away from home. 24/7 care in a climate-controlled, loving environment with outdoor play.',
        cta: 'Book a Stay',
        color: '#ffc092',
        bgColor: '#fff3e8',
    },
    {
        type: 'Walking',
        icon: 'walk',
        description: 'Scheduled urban hikes and park adventures to keep your pet active and happy while you work.',
        cta: 'Schedule Walk',
        color: '#b8d8a8',
        bgColor: '#edf7e7',
    },
    {
        type: 'Training',
        icon: 'school-outline',
        description: 'Positive reinforcement based coaching for all ages, from basic puppy manners to advanced behavior.',
        cta: 'Meet Trainers',
        color: '#f0c0c0',
        bgColor: '#fef0f0',
    },
];

export default function ServicesScreen() {
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');

    const filteredServices = SERVICES.filter(s =>
        s.type.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
                            <Ionicons name="person-circle-outline" size={36} color={COLORS.secondary} />
                        </TouchableOpacity>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={styles.headerBrand}>PetCare</Text>
                            <Text style={styles.headerTitle}>Services</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}>
                            <Ionicons name="notifications" size={24} color={COLORS.secondary} />
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
                    </View>
                    <TouchableOpacity style={styles.searchBtn}>
                        <Text style={styles.searchBtnText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {/* Service Cards */}
                <View style={styles.cardsContainer}>
                    {filteredServices.map((service) => (
                        <View key={service.type} style={[styles.serviceCard, { backgroundColor: service.bgColor }]}>
                            <View style={[styles.serviceIconCircle, { backgroundColor: service.color }]}>
                                <MaterialCommunityIcons name={service.icon} size={28} color="#fff" />
                            </View>
                            <Text style={styles.serviceType}>{service.type}</Text>
                            <Text style={styles.serviceDesc}>{service.description}</Text>
                            <TouchableOpacity
                                style={styles.serviceCta}
                                onPress={() => navigation.navigate('BookAService', { serviceType: service.type })}
                            >
                                <Text style={styles.serviceCtaText}>{service.cta}  →</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* My Bookings Button */}
                <TouchableOpacity
                    style={styles.myBookingsBtn}
                    onPress={() => navigation.navigate('MyBookings')}
                >
                    <Ionicons name="calendar" size={20} color="#fff" />
                    <Text style={styles.myBookingsBtnText}>View My Bookings</Text>
                </TouchableOpacity>

                {/* Membership Banner */}
                <View style={styles.membershipBanner}>
                    <Text style={styles.membershipTitle}>Preferred{'\n'}Membership</Text>
                    <Text style={styles.membershipDesc}>
                        Save 15% on all services and get priority booking with our PetCare Plus+ membership plan.
                    </Text>
                    <TouchableOpacity style={styles.learnMoreBtn}>
                        <Text style={styles.learnMoreText}>Learn More</Text>
                    </TouchableOpacity>
                </View>

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
        paddingTop: 50,
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
    headerBrand: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.secondary,
        fontStyle: 'italic',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.secondary,
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
    searchBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
        marginTop: 12,
    },
    searchBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    // ── Service Cards ──
    cardsContainer: {
        paddingHorizontal: 24,
        marginTop: 20,
    },
    serviceCard: {
        borderRadius: 20,
        padding: 22,
        marginBottom: 16,
        ...SHADOWS.card,
    },
    serviceIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
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
    serviceCta: {
        alignSelf: 'flex-start',
    },
    serviceCtaText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
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
        color: COLORS.secondary,
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
});
