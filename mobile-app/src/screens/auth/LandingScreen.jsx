import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Dimensions, Animated, Image, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
    // ── Animation Values ──
    const fadeHero = useRef(new Animated.Value(0)).current;
    const slideHero = useRef(new Animated.Value(40)).current;
    const scaleHero = useRef(new Animated.Value(0.9)).current;
    const pulseGlow = useRef(new Animated.Value(1)).current;
    const fadeButtons = useRef(new Animated.Value(0)).current;
    const slideButtons = useRef(new Animated.Value(30)).current;
    const fadeFooter = useRef(new Animated.Value(0)).current;

    // Word-by-word title animations
    const titleWords = ['Everything', 'your', 'pet', 'deserves,', 'in', 'one', 'place.'];
    const wordAnims = useRef(titleWords.map(() => new Animated.Value(0))).current;
    const wordSlides = useRef(titleWords.map(() => new Animated.Value(15))).current;
    const accentPulse = useRef(new Animated.Value(1)).current;

    // Subtitle line animations
    const subLine1 = useRef(new Animated.Value(0)).current;
    const subLine2 = useRef(new Animated.Value(0)).current;
    const subLine3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Staggered entrance animation sequence
        Animated.sequence([
            // 1. Hero image fades in + scales up
            Animated.parallel([
                Animated.timing(fadeHero, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(slideHero, { toValue: 0, duration: 800, useNativeDriver: true }),
                Animated.spring(scaleHero, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
            ]),
            // 2. Title words stagger in one by one
            Animated.stagger(120, wordAnims.map((anim, i) =>
                Animated.parallel([
                    Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
                    Animated.timing(wordSlides[i], { toValue: 0, duration: 350, useNativeDriver: true }),
                ])
            )),
            // 3. Subtitle lines stagger in
            Animated.stagger(200, [
                Animated.timing(subLine1, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(subLine2, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(subLine3, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            // 4. Buttons slide up
            Animated.parallel([
                Animated.timing(fadeButtons, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(slideButtons, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
            // 5. Footer fades in
            Animated.timing(fadeFooter, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();

        // Continuous soft glow pulse on hero
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseGlow, { toValue: 1.06, duration: 2000, useNativeDriver: true }),
                Animated.timing(pulseGlow, { toValue: 1, duration: 2000, useNativeDriver: true }),
            ])
        ).start();

        // Continuous breathing pulse on 'deserves'
        Animated.loop(
            Animated.sequence([
                Animated.timing(accentPulse, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
                Animated.timing(accentPulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, []);


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff9ec" />
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* ── Decorative Circles ──────────────────────────── */}
                <View style={styles.decoCircle1} />
                <View style={styles.decoCircle2} />
                <View style={styles.decoCircle3} />

                {/* ── Hero Image Section ──────────────────────────── */}
                <Animated.View style={[
                    styles.heroSection,
                    {
                        opacity: fadeHero,
                        transform: [
                            { translateY: slideHero },
                            { scale: scaleHero },
                        ],
                    },
                ]}>
                    <Animated.View style={[styles.heroGlow, { transform: [{ scale: pulseGlow }] }]} />
                    <View style={styles.heroImageWrap}>
                        <Image
                            source={require('../../../assets/landing_pets.png')}
                            style={styles.heroImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Floating trust badge */}
                    <View style={styles.trustBadge}>
                        <View style={styles.trustBadgeIcon}>
                            <MaterialIcons name="verified" size={16} color="#ffffff" />
                        </View>
                        <View>
                            <Text style={styles.trustBadgeTitle}>TRUSTED BY PET PARENTS</Text>
                            <Text style={styles.trustBadgeSub}>Premium Pet Care</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* ── Title (word-by-word animation) ────────────── */}
                <View style={styles.titleSection}>
                    <View style={styles.titleRow}>
                        {titleWords.map((word, i) => {
                            const isAccent = word === 'deserves,';
                            return (
                                <Animated.Text
                                    key={i}
                                    style={[
                                        styles.titleWord,
                                        isAccent && styles.titleAccent,
                                        {
                                            opacity: wordAnims[i],
                                            transform: [
                                                { translateY: wordSlides[i] },
                                                ...(isAccent ? [{ scale: accentPulse }] : []),
                                            ],
                                        },
                                    ]}
                                >
                                    {word}{' '}
                                </Animated.Text>
                            );
                        })}
                    </View>
                </View>

                {/* ── Subtitle (line-by-line animation) ──────────── */}
                <View style={styles.subtitleSection}>
                    <Animated.Text style={[styles.subtitleLine, { opacity: subLine1 }]}>
                        Health tracking & vet appointments.
                    </Animated.Text>
                    <Animated.Text style={[styles.subtitleLine, { opacity: subLine2 }]}>
                        Grooming & service bookings.
                    </Animated.Text>
                    <Animated.Text style={[styles.subtitleLine, styles.subtitleAccent, { opacity: subLine3 }]}>
                        A vibrant pet community.
                    </Animated.Text>
                </View>


                {/* ── Buttons ─────────────────────────────────────── */}
                <Animated.View style={[
                    styles.buttonsSection,
                    {
                        opacity: fadeButtons,
                        transform: [{ translateY: slideButtons }],
                    },
                ]}>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.88}
                    >
                        <Text style={styles.primaryBtnText}>Get Started</Text>
                        <View style={styles.primaryBtnArrow}>
                            <MaterialIcons name="arrow-forward" size={20} color="#30628a" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.88}
                    >
                        <Text style={styles.secondaryBtnText}>Already have an account?</Text>
                        <Text style={styles.secondaryBtnLink}> Sign In</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* ── Footer ──────────────────────────────────────── */}
                <Animated.View style={[styles.footer, { opacity: fadeFooter }]}>
                    <TouchableOpacity
                        style={styles.reviewsLink}
                        onPress={() => navigation.navigate('PublicFeedback')}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="star" size={16} color="#f59e0b" />
                        <MaterialIcons name="star" size={16} color="#f59e0b" />
                        <MaterialIcons name="star" size={16} color="#f59e0b" />
                        <MaterialIcons name="star" size={16} color="#f59e0b" />
                        <MaterialIcons name="star-half" size={16} color="#f59e0b" />
                        <Text style={styles.reviewsText}>  See Reviews</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff9ec',
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 40,
        alignItems: 'center',
    },

    // ── Decorative ──
    decoCircle1: {
        position: 'absolute',
        top: -60,
        left: -60,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(162,210,255,0.25)',
    },
    decoCircle2: {
        position: 'absolute',
        top: 80,
        right: -80,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,209,179,0.18)',
    },
    decoCircle3: {
        position: 'absolute',
        bottom: 100,
        left: -50,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(162,210,255,0.12)',
    },

    // ── Hero ──
    heroSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 10,
        zIndex: 10,
    },
    heroGlow: {
        position: 'absolute',
        width: width * 0.75,
        height: width * 0.75,
        borderRadius: width * 0.375,
        backgroundColor: 'rgba(162,210,255,0.2)',
        top: 10,
    },
    heroImageWrap: {
        width: width * 0.8,
        height: width * 0.65,
        maxWidth: 360,
        maxHeight: 300,
        borderRadius: 32,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderWidth: 1,
        borderColor: 'rgba(162,210,255,0.3)',
        shadowColor: 'rgba(48,98,138,0.15)',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 1,
        shadowRadius: 30,
        elevation: 8,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    trustBadge: {
        position: 'absolute',
        bottom: -14,
        right: 10,
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: 'rgba(111,78,55,0.12)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#efe8d5',
    },
    trustBadgeIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#30628a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trustBadgeTitle: {
        fontSize: 8,
        fontWeight: '800',
        color: '#72787f',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    trustBadgeSub: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1e1c10',
        marginTop: 1,
    },

    // ── Title ──
    titleSection: {
        marginBottom: 20,
        zIndex: 10,
        paddingHorizontal: 4,
    },
    titleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'baseline',
    },
    titleWord: {
        fontSize: 34,
        fontWeight: '900',
        color: '#1b3d5e',
        lineHeight: 46,
        letterSpacing: -0.5,
    },
    titleAccent: {
        color: '#e74c8b',
        fontStyle: 'italic',
    },

    // ── Subtitle ──
    subtitleSection: {
        alignItems: 'center',
        marginBottom: 28,
        zIndex: 10,
        gap: 4,
    },
    subtitleLine: {
        fontSize: 15,
        color: '#41474e',
        textAlign: 'center',
        lineHeight: 23,
        fontWeight: '500',
    },
    subtitleAccent: {
        color: '#30628a',
        fontWeight: '700',
    },

    // ── Feature Pills ──
    featureRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 32,
        justifyContent: 'center',
        zIndex: 10,
    },
    featurePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#ffffff',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#efe8d5',
        shadowColor: 'rgba(111,78,55,0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        shadowOpacity: 1,
        elevation: 1,
    },
    featurePillIcon: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(162,210,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featurePillText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#79573f',
    },

    // ── Buttons ──
    buttonsSection: {
        width: '100%',
        zIndex: 10,
        marginBottom: 20,
    },
    primaryBtn: {
        width: '100%',
        paddingVertical: 18,
        paddingHorizontal: 28,
        backgroundColor: '#30628a',
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        shadowColor: '#30628a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    primaryBtnText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '800',
        marginRight: 12,
    },
    primaryBtnArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    secondaryBtnText: {
        fontSize: 15,
        color: '#72787f',
        fontWeight: '500',
    },
    secondaryBtnLink: {
        fontSize: 15,
        color: '#30628a',
        fontWeight: '800',
    },

    // ── Footer ──
    footer: {
        zIndex: 10,
    },
    reviewsLink: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#faf3e0',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        gap: 2,
    },
    reviewsText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#79573f',
        marginLeft: 4,
    },
});

export default LandingScreen;
