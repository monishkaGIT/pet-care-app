import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function NotificationItem({
    icon = 'notifications-none',
    iconColor = '#30628a',
    iconBg = '#e9f5ff',
    title,
    subtitle,
    time,
    faded = false,
}) {
    return (
        <View style={[styles.item, faded && styles.itemFaded]}>
            <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                <MaterialIcons name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {time ? <Text style={styles.time}>{time}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        gap: 12,
    },
    itemFaded: { backgroundColor: 'rgba(250,243,224,0.5)', opacity: 0.85 },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: { flex: 1 },
    title: { fontSize: 14, color: '#41474e', fontWeight: '600' },
    subtitle: { fontSize: 12, color: '#72787f', marginTop: 4 },
    time: { fontSize: 12, color: '#a2d2ff', marginLeft: 8 },
});
