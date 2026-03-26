import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import BeagleLottie from '../../components/BeagleLottie';

export default function ServicesScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Pet Services</Text>
                <Text style={styles.subtitle}>Discover grooming, walking, and boarding.</Text>
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
        backgroundColor: COLORS.lightGray
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
