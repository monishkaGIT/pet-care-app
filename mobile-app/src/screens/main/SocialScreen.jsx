import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import BeagleLottie from '../../components/BeagleLottie';

export default function SocialScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Community Feed</Text>
                <Text style={styles.subtitle}>See what other pets are doing near you!</Text>
            </View>
            
            {/* Empty State Implementation */}
            <View style={styles.content}>
                <BeagleLottie type="empty" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: COLORS.background
    },
    header: {
        backgroundColor: COLORS.primary,
        padding: 25,
        paddingTop: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
        ...SHADOWS.header,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.secondary
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.secondary,
        marginTop: 5
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
