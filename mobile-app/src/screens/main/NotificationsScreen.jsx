import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const TODAY_ALERTS = [
    { id: 1, icon: 'favorite', iconColor: '#30628a', iconBg: 'rgba(162,210,255,0.3)', message: ["Milo's", " post was liked by ", "Cooper's", " parent."], time: '2h ago', unread: true },
    { id: 2, icon: 'comment', iconColor: '#79573f', iconBg: 'rgba(255,209,179,0.3)', message: ["Bella", ' commented: "Such a good boy! Let\'s play soon!"'], time: '5h ago', unread: false },
    { id: 3, icon: 'person-add', iconColor: '#8e4e14', iconBg: 'rgba(255,192,146,0.3)', message: ["Luna the Lab", " started following you."], time: '8h ago', unread: false },
];

const WEEK_ALERTS = [
    { id: 4, icon: 'celebration', iconColor: '#72787f', iconBg: '#e9e2d0', message: ["It's ", "Max's", " 3rd birthday! Send a treat."], time: '2 days ago' },
    { id: 5, icon: 'location-on', iconColor: '#72787f', iconBg: '#e9e2d0', message: ["Oliver", " is near Central Park. Want to meet up?"], time: '4 days ago' },
    { id: 6, icon: 'stars', iconColor: '#72787f', iconBg: '#e9e2d0', message: ['Your photo "Beach Day" was featured in ', "Pups of the Week!"], time: '1 week ago' },
];

function AlertItem({ item, faded = false }) {
    return (
        <View style={[styles.alertCard, faded && styles.alertCardFaded]}>
            <View style={[styles.alertIconWrap, { backgroundColor: item.iconBg }]}>
                <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
            </View>
            <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>
                    {item.message.map((part, i) =>
                        i % 2 === 0 ? part : <Text key={i} style={styles.alertBold}>{part}</Text>
                    )}
                </Text>
                <Text style={styles.alertTime}>{item.time}</Text>
            </View>
            {item.unread && <View style={styles.unreadDot} />}
        </View>
    );
}

export default function NotificationsScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="pets" size={22} color="#30628a" />
                    <Text style={styles.headerTitle}>Pet-stagram</Text>
                </View>
                <TouchableOpacity style={styles.headerBtn}>
                    <MaterialIcons name="add-circle" size={24} color="#30628a" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.pageTitle}>Alerts</Text>
                <Text style={styles.pageSub}>Keep track of your furry friend's social life.</Text>

                {/* Today */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today</Text>
                    <View style={styles.dividerLine} />
                </View>
                {TODAY_ALERTS.map(item => <AlertItem key={item.id} item={item} />)}

                {/* This Week */}
                <View style={[styles.sectionHeader, { marginTop: 32 }]}>
                    <Text style={styles.sectionTitle}>This Week</Text>
                    <View style={styles.dividerLine} />
                </View>
                {WEEK_ALERTS.map(item => <AlertItem key={item.id} item={item} faded />)}
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
        paddingTop: 10,
        paddingBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: 'rgba(111,78,55,0.08)', shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 1, elevation: 4,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#30628a', fontStyle: 'italic' },
    headerBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 100 },
    pageTitle: { fontSize: 34, fontWeight: '800', color: '#79573f', letterSpacing: -0.5, marginBottom: 6 },
    pageSub: { fontSize: 14, color: '#41474e', fontWeight: '500', marginBottom: 28 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#79573f' },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(233,226,208,0.5)' },
    alertCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        marginBottom: 12,
        shadowColor: 'rgba(56,56,51,0.04)', shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, shadowOpacity: 1, elevation: 1,
    },
    alertCardFaded: { backgroundColor: 'rgba(250,243,224,0.5)', opacity: 0.85 },
    alertIconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
    alertContent: { flex: 1 },
    alertMessage: { fontSize: 14, color: '#41474e', lineHeight: 20 },
    alertBold: { fontWeight: 'bold', color: '#1e1c10' },
    alertTime: { fontSize: 13, fontWeight: '600', color: 'rgba(48,98,138,0.7)', marginTop: 4 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#30628a', marginTop: 4 },
});
