import React, { useState, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

export default function OtpVerificationScreen({ route, navigation }) {
    const { verifyOtp } = useContext(AuthContext);
    const { email } = route.params || {};

    const [otpValues, setOtpValues] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [modalProps, showModal] = usePetCareModal();

    const ref0 = useRef(null);
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const refs = [ref0, ref1, ref2, ref3];

    const handleOtpChange = (text, index) => {
        // Only allow digits
        const cleanText = text.replace(/[^0-9]/g, '');
        const newValues = [...otpValues];
        newValues[index] = cleanText.slice(-1); // Take the last character
        setOtpValues(newValues);

        // Auto-advance to next input if text entered
        if (cleanText && index < 3) {
            refs[index + 1].current?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!otpValues[index] && index > 0) {
                // Focus previous input if current is already empty
                refs[index - 1].current?.focus();
                const newValues = [...otpValues];
                newValues[index - 1] = '';
                setOtpValues(newValues);
            }
        }
    };

    const handleVerify = async () => {
        const otpCode = otpValues.join('');
        if (otpCode.length < 4) {
            return showModal('warning', 'Missing OTP', 'Please enter your 4-digit verification code.');
        }

        setLoading(true);
        try {
            await verifyOtp(email, otpCode);
            showModal('success', 'Success', 'Account verified successfully!');
        } catch (error) {
            showModal('error', 'Verification Failed', error.response?.data?.message || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <PetCareModal {...modalProps} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                
                {/* Visual Banner Header matching the latest screenshot */}
                <View style={styles.topBanner}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color="#6e4f35" />
                    </TouchableOpacity>
                    <View style={styles.bannerTextCenter}>
                        <Text style={styles.bannerTitle}>PetCare</Text>
                        <Text style={styles.bannerSubtitle}>
                            <Text style={styles.bannerSubtitleHighlight}>Pet</Text> Management App
                        </Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Content Section */}
                    <View style={styles.headingContainer}>
                        <Text style={styles.mainHeading}>Verification Code</Text>
                        <Text style={styles.subHeading}>We've sent a 4-digit code to your email</Text>
                    </View>

                    {/* 4 small visible TextInput boxes row */}
                    <View style={styles.otpBoxesRow}>
                        {otpValues.map((val, index) => (
                            <TextInput
                                key={index}
                                ref={refs[index]}
                                style={[styles.otpBoxInput, val ? styles.otpBoxInputFilled : {}]}
                                keyboardType="number-pad"
                                maxLength={1}
                                value={val}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                selectTextOnFocus
                                autoFocus={index === 0}
                            />
                        ))}
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} disabled={loading} activeOpacity={0.8}>
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.verifyBtnText}>VERIFY</Text>
                        )}
                    </TouchableOpacity>

                    {/* Resend Code Link */}
                    <TouchableOpacity style={styles.resendBtn} onPress={() => showModal('success', 'OTP Resent', 'A new verification code has been sent to your email.')}>
                        <MaterialIcons name="refresh" size={18} color="#805d45" style={styles.resendIcon} />
                        <Text style={styles.resendText}>Resend Code</Text>
                    </TouchableOpacity>

                </ScrollView>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#ffffff' },
    topBanner: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        paddingTop: 16,
    },
    backButton: {
        position: 'absolute',
        top: 24,
        left: 20,
        padding: 8,
        zIndex: 10,
    },
    bannerTextCenter: {
        alignItems: 'center',
    },
    bannerTitle: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#6e4f35',
        marginBottom: 2,
    },
    bannerSubtitle: {
        fontSize: 16,
        color: '#805d45',
        fontWeight: '500',
    },
    bannerSubtitleHighlight: {
        backgroundColor: '#ffe099',
        fontWeight: 'bold',
        color: '#6e4f35',
        paddingHorizontal: 2,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 24,
    },
    headingContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    mainHeading: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 10,
    },
    subHeading: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
    },
    otpBoxesRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        maxWidth: 320,
        marginBottom: 44,
    },
    otpBoxInput: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e2e2df',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 2,
    },
    otpBoxInputFilled: {
        borderColor: '#a2d2ff',
        backgroundColor: '#f6faff',
    },
    verifyBtn: {
        backgroundColor: '#ffb38a',
        width: '100%',
        maxWidth: 320,
        height: 58,
        borderRadius: 29,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: 'rgba(255, 179, 138, 0.4)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 4,
    },
    verifyBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 2,
        color: '#1e1c10',
    },
    resendBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        padding: 8,
    },
    resendIcon: {
        marginRight: 6,
    },
    resendText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#805d45',
    }
});
