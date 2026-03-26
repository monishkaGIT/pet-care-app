import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function FeedbackScreen() {
    return (
        <View style={styles.container}>
            <Ionicons name="chatbubble-ellipses-outline" size={64} color={COLORS.primary} />
            <Text style={styles.text}>No Data Available Yet</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    text: { fontSize: 18, color: COLORS.secondary, fontWeight: 'bold', marginTop: 16 },
});
