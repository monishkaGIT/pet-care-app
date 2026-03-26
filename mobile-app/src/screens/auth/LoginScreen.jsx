import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
        setLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Welcome Back!</Text>
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Email" 
                    value={email} 
                    onChangeText={setEmail} 
                    autoCapitalize="none" 
                    keyboardType="email-address" 
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Password" 
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                />
                
                <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.link}>Don't have an account? Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: COLORS.background },
    card: { backgroundColor: COLORS.surface, padding: 24, borderRadius: 12, elevation: 4 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: COLORS.secondary },
    input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, padding: 12, marginBottom: 16 },
    btn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center', ...SHADOWS.button },
    btnText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 16 },
    link: { marginTop: 16, color: COLORS.secondary, textAlign: 'center' }
});
