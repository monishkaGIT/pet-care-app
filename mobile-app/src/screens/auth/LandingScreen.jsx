import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';

const LandingScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={require('../../../assets/logo.png')}
                    style={styles.logo}
                />
                <Text style={styles.title}>Welcome to PetCare!</Text>
                <Text style={styles.subtitle}>The ultimate pet management system.</Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.buttonPrimary}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.buttonPrimaryText}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonSecondary}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.buttonSecondaryText}>I already have an account</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 50,
        paddingHorizontal: 20
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 30,
        resizeMode: 'contain'
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.secondary,
        textAlign: 'center',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
        marginBottom: 40
    },
    footer: {
        width: '100%',
        paddingBottom: 20
    },
    buttonPrimary: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
        ...SHADOWS.button,
    },
    buttonPrimaryText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: 'bold'
    },
    buttonSecondary: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.secondary,
        borderWidth: 2,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    buttonSecondaryText: {
        color: COLORS.secondary,
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default LandingScreen;
