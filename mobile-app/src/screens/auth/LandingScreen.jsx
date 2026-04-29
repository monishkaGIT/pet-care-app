import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Decorative Background Blur */}
                <View style={styles.decorativeCircle} />

                {/* Hero Icon */}
                <View style={styles.heroContainer}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconInnerContainer}>
                            <MaterialIcons name="pets" size={100} color="#30628a" style={{ opacity: 0.9 }} />
                        </View>
                        
                        {/* Floating Detail Badge */}
                        <View style={styles.floatingBadge}>
                            <View style={styles.badgeIconBg}>
                                <MaterialIcons name="pets" size={16} color="#ffffff" />
                            </View>
                            <View>
                                <Text style={styles.badgeTitle}>PETCARE PLUS</Text>
                                <Text style={styles.badgeSubtitle}>Verified Comfort</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Typography Section */}
                <View style={styles.typographySection}>
                    <Text style={styles.title}>
                        Modern care for your <Text style={styles.titleHighlight}>best friend.</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        A premium space designed for the holistic well-being of your pets. Simplified scheduling, health tracking, and community.
                    </Text>
                </View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    <TouchableOpacity
                        style={styles.buttonPrimary}
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonPrimaryText}>Get Started</Text>
                        <MaterialIcons name="arrow-forward" size={24} color="#ffffff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buttonSecondary}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonSecondaryText}>Login</Text>
                    </TouchableOpacity>

                    {/* Bottom row: Bento + Reviews */}
                    <View style={styles.bottomRow}>
                        <View style={styles.bentoItem}>
                            <MaterialIcons name="health-and-safety" size={20} color="#30628a" />
                            <Text style={styles.bentoText}>Pro Health</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.reviewsBtn}
                            onPress={() => navigation.navigate('PublicFeedback')}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="star" size={16} color="#f59e0b" />
                            <Text style={styles.reviewsBtnText}>Reviews</Text>
                        </TouchableOpacity>
                        <View style={styles.bentoItem}>
                            <MaterialIcons name="event" size={20} color="#30628a" />
                            <Text style={styles.bentoText}>Auto-Sched</Text>
                        </View>
                    </View>
                </View>

                {/* Footer Visual */}
                <View style={styles.footerCircle} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff9ec',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 30,
        alignItems: 'center',
    },
    decorativeCircle: {
        position: 'absolute',
        top: -40,
        left: -40,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(162, 210, 255, 0.3)', // primary-container
    },
    heroContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 50,
        marginTop: 20,
        zIndex: 10,
    },
    iconContainer: {
        width: width * 0.7,
        height: width * 0.7,
        maxWidth: 320,
        maxHeight: 320,
        backgroundColor: 'rgba(162, 210, 255, 0.2)',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'rgba(48, 98, 138, 0.1)',
        borderWidth: 1,
    },
    iconInnerContainer: {
        width: width * 0.45,
        height: width * 0.45,
        maxWidth: 200,
        maxHeight: 200,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingBadge: {
        position: 'absolute',
        bottom: -15,
        right: -10,
        backgroundColor: 'rgba(255, 249, 236, 0.9)',
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#6f4e37',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    badgeIconBg: {
        width: 36,
        height: 36,
        backgroundColor: '#79573f', // secondary
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    badgeTitle: {
        fontSize: 10,
        color: '#79573f',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    badgeSubtitle: {
        fontSize: 12,
        color: '#41474e',
        fontWeight: '500',
    },
    typographySection: {
        alignItems: 'center',
        marginBottom: 40,
        zIndex: 10,
    },
    title: {
        fontSize: 40,
        fontWeight: '800',
        color: '#79573f',
        textAlign: 'center',
        marginBottom: 15,
        lineHeight: 48,
    },
    titleHighlight: {
        color: '#30628a',
        fontStyle: 'italic',
    },
    subtitle: {
        fontSize: 16,
        color: '#41474e',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    bottomSection: {
        marginTop: 'auto',
        width: '100%',
        zIndex: 10,
    },
    buttonPrimary: {
        width: '100%',
        paddingVertical: 18,
        paddingHorizontal: 30,
        backgroundColor: '#30628a',
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        shadowColor: '#30628a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPrimaryText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 10,
    },
    buttonSecondary: {
        width: '100%',
        paddingVertical: 18,
        paddingHorizontal: 30,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#79573f',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    buttonSecondaryText: {
        color: '#79573f',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: 0.9,
    },
    bentoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#faf3e0',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    bentoText: {
        marginLeft: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#79573f',
    },
    reviewsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#faf3e0',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        gap: 5,
    },
    reviewsBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#79573f',
    },
    footerCircle: {
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(255, 209, 179, 0.2)', // secondary-container
        zIndex: 1,
    }
});

export default LandingScreen;
