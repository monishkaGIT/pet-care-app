import React, { useCallback, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Platform,
    StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationSections from '../../components/NotificationSections';
import { NotificationsContext } from '../../context/NotificationsContext';

const healthNotifications = [
    {
        id: 'health-1',
        icon: 'health-and-safety',
        iconColor: '#1f5f91',
        iconBg: 'rgba(31,95,145,0.08)',
        title: 'Health reminder',
        subtitle: 'Bella vaccination is due in 3 days.',
        time: '2d ago',
    },
    {
        id: 'health-2',
        icon: 'monitor-weight',
        iconColor: '#30628a',
        iconBg: 'rgba(162,210,255,0.25)',
        title: 'Weight log check-in',
        subtitle: 'It has been 7 days since Milo\'s last weight update.',
        time: '1w ago',
    },
];

const serviceNotifications = [
    {
        id: 'service-1',
        icon: 'room-service',
        iconColor: '#7a5840',
        iconBg: 'rgba(122,88,64,0.08)',
        title: 'Service confirmed',
        subtitle: 'Grooming appointment confirmed for Milo on May 5.',
        time: '1h ago',
    },
    {
        id: 'service-2',
        icon: 'event-available',
        iconColor: '#79573f',
        iconBg: 'rgba(255,209,179,0.35)',
        title: 'Upcoming booking',
        subtitle: 'Vet consultation starts tomorrow at 10:00 AM.',
        time: '1d ago',
    },
];

export default function MainNotificationsScreen() {
    const { markAllRead } = useContext(NotificationsContext);

    useFocusEffect(
        useCallback(() => {
            if (markAllRead) markAllRead();
        }, [markAllRead])
    );

    const sections = [
        { key: 'health', title: 'Health', items: healthNotifications },
        { key: 'service', title: 'Service', items: serviceNotifications },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="notifications-active" size={22} color="#30628a" />
                    <Text style={styles.headerTitle}>Notifications</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.pageTitle}>Health & Services</Text>
                <Text style={styles.pageSub}>Updates about pet health records and booked services.</Text>

                <NotificationSections sections={sections} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    header: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 10,
        paddingBottom: 18,
        shadowColor: 'rgba(111,78,55,0.08)',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        shadowOpacity: 1,
        elevation: 4,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#30628a', fontStyle: 'italic' },
    scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 80 },
    pageTitle: { fontSize: 30, fontWeight: '800', color: '#79573f', marginBottom: 6 },
    pageSub: { fontSize: 14, color: '#41474e', marginBottom: 22 },
});