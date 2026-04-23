import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const TRENDING_TAGS = [
    { id: 1, tag: '#PuppyLove', posts: '12.5k posts', icon: 'pets', bg: '#ffffff', iconBg: '#a2d2ff', iconColor: '#275b82' },
    { id: 2, tag: '#CatNap', posts: '8.2k posts', icon: 'hotel', bg: 'rgba(162,210,255,0.3)', iconBg: '#ffffff', iconColor: '#79573f' },
    { id: 3, tag: '#TreatsOnly', posts: '4.1k posts', icon: 'restaurant', bg: '#ffffff', iconBg: 'rgba(255,192,146,0.4)', iconColor: '#8e4e14' },
    { id: 4, tag: '#ParkLife', posts: '15.9k posts', icon: 'park', bg: '#faf3e0', iconBg: '#ffffff', iconColor: '#30628a' },
];

const POST_GRID_COLORS = [
    ['rgba(162,210,255,0.4)', '#e9e2d0', 'rgba(162,210,255,0.2)'],
    ['#faf3e0', '#a2d2ff', '#e9e2d0'],
    ['rgba(162,210,255,0.3)', '#faf3e0', 'rgba(162,210,255,0.1)'],
    ['#e9e2d0', 'rgba(162,210,255,0.6)', '#faf3e0'],
];

export default function ExploreScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.headerBtn}>
                        <MaterialIcons name="home" size={24} color="#30628a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Explore</Text>
                </View>
                <TouchableOpacity style={styles.headerBtn}>
                    <MaterialIcons name="add-circle" size={24} color="#30628a" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Search */}
                <View style={styles.searchWrapper}>
                    <MaterialIcons name="search" size={22} color="#79573f" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Find your favorite paws..."
                        placeholderTextColor="#72787f"
                    />
                </View>

                {/* Trending Tags */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionPreTitle}>WHAT'S BARKING</Text>
                    <Text style={styles.sectionTitle}>Trending Tags</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
                    {TRENDING_TAGS.map((tag) => (
                        <TouchableOpacity key={tag.id} style={[styles.tagCard, { backgroundColor: tag.bg }]} activeOpacity={0.8}>
                            <View style={[styles.tagIconWrap, { backgroundColor: tag.iconBg }]}>
                                <MaterialIcons name={tag.icon} size={22} color={tag.iconColor} />
                            </View>
                            <Text style={styles.tagName}>{tag.tag}</Text>
                            <Text style={styles.tagCount}>{tag.posts}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerLabel}>CURATED FEED</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Post Grid */}
                <View style={styles.postGrid}>
                    {POST_GRID_COLORS.flat().map((color, index) => (
                        <TouchableOpacity key={index} style={[styles.postCell, { backgroundColor: color }]} activeOpacity={0.8}>
                            <MaterialIcons name="image" size={36} color="rgba(121,87,63,0.15)" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#faf3e0' },
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
    headerBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#30628a' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
    searchWrapper: {
        backgroundColor: '#faf3e0', borderWidth: 2, borderColor: '#e9e2d0',
        borderRadius: 30, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 18, marginBottom: 28,
        shadowColor: 'rgba(111,78,55,0.04)', shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, shadowOpacity: 1, elevation: 1,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 52, fontSize: 15, color: '#1e1c10' },
    sectionHeader: { marginBottom: 16, paddingHorizontal: 4 },
    sectionPreTitle: { fontSize: 10, fontWeight: 'bold', color: '#30628a', letterSpacing: 2, marginBottom: 4 },
    sectionTitle: { fontSize: 26, fontWeight: '800', color: '#79573f' },
    tagsScroll: { paddingBottom: 16, gap: 12 },
    tagCard: {
        width: 150, backgroundColor: '#ffffff',
        borderRadius: 16, padding: 18,
        marginRight: 4,
        shadowColor: 'rgba(111,78,55,0.04)', shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, shadowOpacity: 1, elevation: 2,
        justifyContent: 'space-between', minHeight: 180,
    },
    tagIconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 'auto' },
    tagName: { fontSize: 16, fontWeight: 'bold', color: '#79573f', marginTop: 16, marginBottom: 4 },
    tagCount: { fontSize: 12, color: '#72787f', fontWeight: '500' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 28 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#e9e2d0' },
    dividerLabel: { fontSize: 10, fontWeight: 'bold', color: 'rgba(121,87,63,0.4)', letterSpacing: 2 },
    postGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    postCell: {
        width: '31.2%',
        aspectRatio: 1,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
});
