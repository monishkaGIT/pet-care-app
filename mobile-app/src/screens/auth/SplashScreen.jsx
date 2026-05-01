import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS } from '../../constants/theme';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <LottieView
                    source={{ uri: 'https://assets3.lottiefiles.com/packages/lf20_syqnfe7c.json' }}
                    autoPlay
                    loop
                    style={styles.lottie}
                />
                <Text style={styles.loadingText}>Waking up your pets...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    lottie: {
        width: 220,
        height: 220,
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.secondary,
        fontSize: 20,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
});
