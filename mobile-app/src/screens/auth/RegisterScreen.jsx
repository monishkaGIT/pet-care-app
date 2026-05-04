import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

export default function RegisterScreen({ navigation }) {
    const { register, verifyOtp } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [otp, setOtp] = useState('');
    const [modalProps, showModal] = usePetCareModal();

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true
        });

        if (!result.canceled) {
            setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password || !phone.trim() || !address.trim()) {
            return showModal('warning', 'Missing Fields', 'Please fill all required fields.');
        }
        if (name.trim().length < 2) {
            return showModal('warning', 'Invalid Name', 'Name must be at least 2 characters.');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return showModal('warning', 'Invalid Email', 'Please enter a valid email address (e.g. user@example.com).');
        }
        if (password.length < 6) {
            return showModal('warning', 'Weak Password', 'Password must be at least 6 characters.');
        }
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            return showModal('warning', 'Invalid Phone', 'Please enter a valid phone number (at least 10 digits).');
        }
        if (address.trim().length < 5) {
            return showModal('warning', 'Invalid Address', 'Please enter a valid address (at least 5 characters).');
        }

        setLoading(true);
        try {
            const formData = { name: name.trim(), email: email.trim(), password, phone: phone.trim(), address: address.trim(), profileImage, role: 'user' };
            const data = await register(formData);
            showModal('success', 'OTP Sent', data.message, [
                { text: 'OK', style: 'primary', onPress: () => navigation.navigate('OtpVerification', { email: email.trim(), registrationData: formData }) },
            ]);
        } catch (error) {
            showModal('error', 'Registration Failed', error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            return showModal('warning', 'Missing OTP', 'Please enter the verification OTP.');
        }

        setLoading(true);
        try {
            await verifyOtp(email.trim(), otp.trim());
            showModal('success', 'Account Created', 'Your account has been created successfully!');
        } catch (error) {
            showModal('error', 'Verification Failed', error.response?.data?.message || 'Invalid or expired OTP code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <PetCareModal {...modalProps} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Decorative Ambient Glows */}
                    <View style={styles.glowTop} />
                    <View style={styles.glowBottom} />

                    <View style={styles.mainContainer}>
                        
                        <View style={styles.headerSection}>
                            <Text style={styles.brandTitle}>Join PetCare</Text>
                            <Text style={styles.brandSubtitle}>
                                {showOtpForm 
                                    ? `Enter the verification code sent to ${email}.`
                                    : 'Create an account to start managing your pets with ease.'
                                }
                            </Text>
                        </View>

                        <View style={styles.card}>
                            {!showOtpForm ? (
                                <>
                                    {/* Profile Image Picker */}
                                    <View style={styles.imagePickerContainer}>
                                        <TouchableOpacity onPress={pickImage} style={styles.imagePicker} activeOpacity={0.8}>
                                            {profileImage ? (
                                                <Image source={{ uri: profileImage }} style={styles.image} />
                                            ) : (
                                                <View style={styles.placeholderContainer}>
                                                    <MaterialIcons name="add-a-photo" size={28} color="#345d75" />
                                                    <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {/* Inputs */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>FULL NAME</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="person" size={20} color="#81817a" style={styles.inputIcon} />
                                            <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor="#81817a" value={name} onChangeText={setName} />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>EMAIL ADDRESS</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="mail" size={20} color="#81817a" style={styles.inputIcon} />
                                            <TextInput style={styles.input} placeholder="hello@example.com" placeholderTextColor="#81817a" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>PASSWORD</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="lock" size={20} color="#81817a" style={styles.inputIcon} />
                                            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#81817a" value={password} onChangeText={setPassword} secureTextEntry />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>PHONE NUMBER</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="phone" size={20} color="#81817a" style={styles.inputIcon} />
                                            <TextInput style={styles.input} placeholder="+1 234 567 890" placeholderTextColor="#81817a" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>ADDRESS</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="location-pin" size={20} color="#81817a" style={styles.inputIcon} />
                                            <TextInput style={styles.input} placeholder="123 Pet Street" placeholderTextColor="#81817a" value={address} onChangeText={setAddress} />
                                        </View>
                                    </View>

                                    {/* Submit */}
                                    <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <View style={styles.btnContent}>
                                                <Text style={styles.submitBtnText}>Create Account</Text>
                                                <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>VERIFICATION OTP</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialIcons name="vpn-key" size={20} color="#81817a" style={styles.inputIcon} />
                                            <TextInput style={styles.input} placeholder="Enter 4 or 6-digit OTP" placeholderTextColor="#81817a" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
                                        </View>
                                    </View>

                                    {/* Submit OTP */}
                                    <TouchableOpacity style={styles.submitBtn} onPress={handleVerifyOtp} disabled={loading} activeOpacity={0.8}>
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <View style={styles.btnContent}>
                                                <Text style={styles.submitBtnText}>Verify OTP</Text>
                                                <MaterialIcons name="check-circle" size={20} color="#ffffff" />
                                            </View>
                                        )}
                                    </TouchableOpacity>

                                    {/* Back to register form */}
                                    <TouchableOpacity style={styles.backBtn} onPress={() => setShowOtpForm(false)}>
                                        <Text style={styles.backBtnText}>Change details / Back</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        <View style={styles.bottomAction}>
                            <Text style={styles.bottomText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.bottomLinkText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fefcf4' },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 },
    glowTop: { position: 'absolute', top: -50, right: -50, width: 250, height: 250, backgroundColor: 'rgba(185, 226, 255, 0.3)', borderRadius: 125 },
    glowBottom: { position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, backgroundColor: 'rgba(255, 209, 178, 0.4)', borderRadius: 100 },
    mainContainer: { width: '100%', zIndex: 10 },
    headerSection: { alignItems: 'center', marginBottom: 30 },
    brandTitle: { fontSize: 32, fontWeight: '800', color: '#383833', marginBottom: 8 },
    brandSubtitle: { fontSize: 16, color: '#805d45', fontWeight: '500', textAlign: 'center', paddingHorizontal: 20 },
    card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, shadowColor: 'rgba(56, 56, 51, 0.04)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 40, elevation: 6, borderWidth: 1, borderColor: 'rgba(186, 185, 178, 0.1)' },
    imagePickerContainer: { alignItems: 'center', marginBottom: 24 },
    imagePicker: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fbf9f1', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: '#b9e2ff', borderStyle: 'dashed' },
    image: { width: '100%', height: '100%' },
    placeholderContainer: { alignItems: 'center', justifyContent: 'center' },
    imagePlaceholderText: { color: '#345d75', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 10, fontWeight: 'bold', color: '#805d45', letterSpacing: 1.5, marginBottom: 8, marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fbf9f1', borderRadius: 10, paddingHorizontal: 16, height: 56 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: '#383833' },
    roleContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    roleBtn: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderWidth: 2, borderColor: '#fbf9f1', backgroundColor: '#fbf9f1', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 },
    roleBtnActive: { backgroundColor: '#345d75', borderColor: '#345d75' },
    roleText: { color: '#345d75', fontWeight: 'bold', fontSize: 14 },
    roleTextActive: { color: '#ffffff' },
    submitBtn: { backgroundColor: '#345d75', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#345d75', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    btnContent: { flexDirection: 'row', alignItems: 'center' },
    submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
    backBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 10 },
    backBtnText: { color: '#805d45', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
    bottomAction: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    bottomText: { fontSize: 14, color: '#805d45', fontWeight: '500' },
    bottomLinkText: { fontSize: 14, color: '#416982', fontWeight: 'bold' }
});
