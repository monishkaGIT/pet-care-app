import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

export default function LoginScreen({ navigation }) {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalProps, showModal] = usePetCareModal();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) return showModal('warning', 'Missing Fields', 'Please enter both email and password.');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) return showModal('warning', 'Invalid Email', 'Please enter a valid email address.');
        if (password.length < 6) return showModal('warning', 'Weak Password', 'Password must be at least 6 characters.');
        setLoading(true);
        try {
            await login(email.trim(), password);
        } catch (error) {
            showModal('error', 'Login Failed', error.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <PetCareModal {...modalProps} />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.glowTop} />
                    <View style={styles.glowBottom} />

                    <View style={styles.mainContainer}>
                        
                        <View style={styles.brandSection}>
                            <View style={styles.iconBox}>
                                <MaterialIcons name="pets" size={32} color="#124057" />
                            </View>
                            <Text style={styles.brandTitle}>PetCare</Text>
                            <Text style={styles.brandSubtitle}>Every pet deserves the best atelier experience.</Text>
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

                            <View style={styles.inputGroup}>
                                <View style={styles.passwordHeader}>
                                    <Text style={styles.label}>PASSWORD</Text>
                                </View>
                                <View style={styles.inputContainer}>
                                    <MaterialIcons name="lock" size={20} color="#81817a" style={styles.inputIcon} />
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="••••••••" 
                                        placeholderTextColor="#81817a"
                                        value={password} 
                                        onChangeText={setPassword} 
                                        secureTextEntry 
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <View style={styles.btnContent}>
                                        <Text style={styles.submitBtnText}>Sign In</Text>
                                        <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
                                    </View>
                                )}
                            </TouchableOpacity>


                        </View>

                        <View style={styles.bottomAction}>
                            <Text style={styles.bottomText}>New to our atelier? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.bottomLinkText}>Create an account</Text>
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
    brandSection: {
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
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#805d45',
        letterSpacing: 1.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    forgotText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#416982',
        letterSpacing: 1.5,
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
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 30,
    },
    dividerLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(186, 185, 178, 0.2)',
    },
    dividerText: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#81817a',
        letterSpacing: 1.5,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    socialBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fbf9f1',
        height: 48,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    socialBtnText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#383833',
        letterSpacing: 1,
        marginLeft: 8,
    },
    bottomAction: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    bottomText: {
        fontSize: 14,
        color: '#805d45',
        fontWeight: '500',
    },
    bottomLinkText: {
        fontSize: 14,
        color: '#416982',
        fontWeight: 'bold',
    }
});
