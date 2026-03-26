import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants/theme';
import BeagleLottie from '../../components/BeagleLottie';

export default function SplashScreen({ navigation }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Landing');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <BeagleLottie type="loading" />
            <Text style={styles.loadingText}>Waking up your pets...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: -40,
        color: COLORS.secondary,
        fontSize: 22,
        fontWeight: 'bold'
    }
});
