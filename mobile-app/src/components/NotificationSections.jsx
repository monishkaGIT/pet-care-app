import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NotificationItem from './NotificationItem';

export default function NotificationSections({ sections = [] }) {
    return (
        <>
            {sections
                .filter((section) => section?.items?.length > 0)
                .map((section, sectionIndex) => (
                    <View key={section.key || section.title} style={sectionIndex > 0 ? styles.sectionSpacing : null}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {section.items.map((item) => (
                            <NotificationItem
                                key={item.id}
                                icon={item.icon}
                                iconColor={item.iconColor}
                                iconBg={item.iconBg}
                                title={item.title || item.message}
                                subtitle={item.subtitle}
                                time={item.time}
                                faded={Boolean(section.faded || item.faded)}
                            />
                        ))}
                    </View>
                ))}
        </>
    );
}

const styles = StyleSheet.create({
    sectionSpacing: { marginTop: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#79573f' },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(233,226,208,0.65)' },
});