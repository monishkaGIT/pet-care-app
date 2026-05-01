import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

export default function ForgotPasswordScreen({ navigation, route }) {
    const { requestPasswordReset, resetPassword } = useContext(AuthContext);
    const [email, setEmail] = useState(route.params?.email || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalProps, showModal] = usePetCareModal();

    useEffect(() => {
        if (route.params?.email) {
            setEmail(route.params.email);
        }
    }, [route.params?.email]);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSendOtp = async () => {
        if (!email.trim()) {
            return showModal('warning', 'Missing Email', 'Please enter your email address.');
        }
        if (!emailRegex.test(email.trim())) {
            return showModal('warning', 'Invalid Email', 'Please enter a valid email address.');
        }

        setLoading(true);
        try {
            const data = await requestPasswordReset(email.trim());
            setOtpSent(true);
            showModal('success', 'OTP Sent', data.message || 'A password reset OTP has been sent to your email.');
        } catch (error) {
            showModal('error', 'Request Failed', error.response?.data?.message || 'Unable to send reset OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email.trim() || !otp.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            return showModal('warning', 'Missing Fields', 'Please complete all fields.');
        }
        if (!emailRegex.test(email.trim())) {
            return showModal('warning', 'Invalid Email', 'Please enter a valid email address.');
        }
        if (otp.trim().length < 4) {
            return showModal('warning', 'Invalid Code', 'Please enter the 4-digit OTP code.');
        }
        if (newPassword.length < 6) {
            return showModal('warning', 'Weak Password', 'New password must be at least 6 characters.');
        }
        if (newPassword !== confirmPassword) {
            return showModal('warning', 'Password Mismatch', 'New passwords do not match.');
        }

        setLoading(true);
        try {
            const data = await resetPassword(email.trim(), otp.trim(), newPassword);
            showModal('success', 'Password Reset', data.message || 'Your password has been updated.', [
                { text: 'Back to Login', style: 'primary', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (error) {
            showModal('error', 'Reset Failed', error.response?.data?.message || 'Unable to reset your password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <PetCareModal {...modalProps} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.glowTop} />
                    <View style={styles.glowBottom} />

                    <View style={styles.mainContainer}>
                        <View style={styles.headerSection}>
                            <View style={styles.iconBox}>
                                <MaterialIcons name="lock-reset" size={32} color="#124057" />
                            </View>
                            <Text style={styles.brandTitle}>Reset Password</Text>
                            <Text style={styles.brandSubtitle}>
                                {otpSent
                                    ? 'Enter the OTP sent to your email and choose a new password.'
                                    : 'Enter your email to receive a password reset OTP.'}
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>EMAIL ADDRESS</Text>
                                <View style={styles.inputContainer}>
                                    <MaterialIcons name="mail" size={20} color="#81817a" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="hello@petatelier.com"
                                        placeholderTextColor="#81817a"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            {otpSent ? (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>OTP CODE</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="vpn-key" size={20} color="#81817a" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter 4-digit OTP"
                                                placeholderTextColor="#81817a"
                                                value={otp}
                                                onChangeText={setOtp}
                                                keyboardType="number-pad"
                                                maxLength={4}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>NEW PASSWORD</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="lock" size={20} color="#81817a" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="••••••••"
                                                placeholderTextColor="#81817a"
                                                value={newPassword}
                                                onChangeText={setNewPassword}
                                                secureTextEntry
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>CONFIRM PASSWORD</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="lock-outline" size={20} color="#81817a" style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="••••••••"
                                                placeholderTextColor="#81817a"
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                secureTextEntry
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity style={styles.submitBtn} onPress={handleResetPassword} disabled={loading} activeOpacity={0.8}>
                                        {loading ? (
                                            <ActivityIndicator color="#ffffff" />
                                        ) : (
                                            <View style={styles.btnContent}>
                                                <Text style={styles.submitBtnText}>Reset Password</Text>
                                                <MaterialIcons name="check-circle" size={20} color="#ffffff" />
                                            </View>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.linkBtn} onPress={handleSendOtp} disabled={loading}>
                                        <Text style={styles.linkText}>Resend OTP</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity style={styles.submitBtn} onPress={handleSendOtp} disabled={loading} activeOpacity={0.8}>
                                        {loading ? (
                                            <ActivityIndicator color="#ffffff" />
                                        ) : (
                                            <View style={styles.btnContent}>
                                                <Text style={styles.submitBtnText}>Send OTP</Text>
                                                <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </>
                            )}

                            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.backBtnText}>Back to Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fefcf4',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    glowTop: {
        position: 'absolute',
        top: -50,
        left: -50,
        width: 250,
        height: 250,
        backgroundColor: 'rgba(185, 226, 255, 0.3)',
        borderRadius: 125,
    },
    glowBottom: {
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 200,
        height: 200,
        backgroundColor: 'rgba(255, 209, 178, 0.4)',
        borderRadius: 100,
    },
    mainContainer: {
        width: '100%',
        zIndex: 10,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconBox: {
        width: 70,
        height: 70,
        backgroundColor: '#b9e2ff',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: 'rgba(56, 56, 51, 0.08)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 4,
    },
    brandTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#383833',
        marginBottom: 8,
        textAlign: 'center',
    },
    brandSubtitle: {
        fontSize: 16,
        color: '#805d45',
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        shadowColor: 'rgba(56, 56, 51, 0.04)',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 1,
        shadowRadius: 40,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(186, 185, 178, 0.1)',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#805d45',
        letterSpacing: 1.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fbf9f1',
        borderRadius: 10,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#383833',
    },
    submitBtn: {
        backgroundColor: '#345d75',
        borderRadius: 30,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#345d75',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    linkBtn: {
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 2,
    },
    linkText: {
        color: '#805d45',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    backBtn: {
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    backBtnText: {
        color: '#416982',
        fontSize: 14,
        fontWeight: '700',
    },
});
