import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function RegisterScreen({ navigation }) {
    const { register } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);

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
        if (!name || !email || !password || !phone || !address) {
            return Alert.alert('Error', 'Please fill all required fields');
        }

        setLoading(true);
        try {
            await register({ name, email, password, phone, address, profileImage, role });
            // Auto-login happens in AuthContext — user is set automatically
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Create Account</Text>

                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.image} />
                    ) : (
                        <Text style={styles.imagePlaceholderText}>+ Add Photo</Text>
                    )}
                </TouchableOpacity>

                <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />

                <View style={styles.roleContainer}>
                    <TouchableOpacity 
                        style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]} 
                        onPress={() => setRole('user')}
                    >
                        <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>User</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]} 
                        onPress={() => setRole('admin')}
                    >
                        <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>Admin</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Register</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Already have an account? Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: COLORS.background },
    card: { backgroundColor: COLORS.surface, padding: 24, borderRadius: 12, elevation: 4 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: COLORS.secondary },
    imagePicker: { 
        alignSelf: 'center', 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        backgroundColor: COLORS.disabledBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        overflow: 'hidden'
    },
    image: { width: '100%', height: '100%' },
    imagePlaceholderText: { color: COLORS.textMuted, fontSize: 12 },
    input: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, padding: 12, marginBottom: 16 },
    roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    roleBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
    roleBtnActive: { backgroundColor: COLORS.primary },
    roleText: { color: COLORS.secondary, fontWeight: 'bold' },
    roleTextActive: { color: COLORS.surface },
    btn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, alignItems: 'center', ...SHADOWS.button },
    btnText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 16 },
    link: { marginTop: 16, color: COLORS.secondary, textAlign: 'center' }
});
