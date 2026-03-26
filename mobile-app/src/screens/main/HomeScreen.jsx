import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import BeagleLottie from '../../components/BeagleLottie';

export default function HomeScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* Profile icon - top left */}
                <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
                    <View style={styles.profileIconInner}>
                        <Ionicons name="person" size={22} color={COLORS.secondary} />
                    </View>
                </TouchableOpacity>

                <Text style={styles.title}>My Pets</Text>
                <Text style={styles.subtitle}>Welcome back to PetCare!</Text>
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
    profileBtn: {
        position: 'absolute',
        top: 46,
        left: 20,
    },
    profileIconInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.secondary,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.secondary
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.secondary,
        marginTop: 5
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
