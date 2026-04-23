import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { fetchServices } from '../../api/serviceApi';

const CATEGORY_ICONS = {
    'Grooming': 'content-cut',
    'Boarding': 'home',
    'Medical Care': 'medical-services',
    'Training': 'sports',
    'Walking': 'directions-walk',
};

function ServiceCard({ item }) {
    const iconName = CATEGORY_ICONS[item.category] || 'pets';

    return (
        <View style={[styles.card, SHADOWS.editorial]}>
            {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
            )}
            <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                    <View style={styles.iconCircle}>
                        <MaterialIcons name={iconName} size={22} color={COLORS.primary} />
                    </View>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>
                </View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardFooter}>
                    <Text style={styles.priceText}>${item.price?.toFixed(2)}</Text>
                    <View style={styles.availableBadge}>
                        <View style={styles.greenDot} />
                        <Text style={styles.availableText}>Available</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default function ServicesScreen({ navigation }) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    const loadServices = useCallback(async () => {
        try {
            const data = await fetchServices();
            // Only show active services to regular users
            setServices(data.filter((s) => s.isActive));
        } catch (error) {
            console.error('Failed to load services:', error?.response?.data?.message || error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadServices();
        });

        return unsubscribe;
    }, [navigation, loadServices]);

    const onRefresh = () => {
        setRefreshing(true);
        loadServices();
    };

    // Derive categories
    const categories = ['All', ...new Set(services.map((s) => s.category))];

    const filteredServices =
        activeFilter === 'All' ? services : services.filter((s) => s.category === activeFilter);

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: COLORS.onSurfaceVariant }}>Loading services...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Pet Services</Text>
                <Text style={styles.subtitle}>Discover grooming, walking, and boarding.</Text>
            </View>

            {/* Category filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
            >
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.chip, activeFilter === cat && styles.chipActive]}
                        onPress={() => setActiveFilter(cat)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.chipText, activeFilter === cat && styles.chipTextActive]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                {filteredServices.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="search-off" size={48} color={COLORS.outlineVariant} />
                        <Text style={styles.emptyTitle}>No services available</Text>
                        <Text style={styles.emptySubtitle}>Check back later for new pet care offerings</Text>
                    </View>
                ) : (
                    filteredServices.map((item) => <ServiceCard key={item._id} item={item} />)
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: { justifyContent: 'center', alignItems: 'center' },
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
        color: COLORS.secondary,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.secondary,
        marginTop: 5,
    },

    /* Filter chips */
    chipRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
    chip: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: COLORS.surfaceContainerHigh,
    },
    chipActive: { backgroundColor: COLORS.primary },
    chipText: { fontSize: 13, fontWeight: '600', color: COLORS.secondary },
    chipTextActive: { color: '#fff' },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    /* Empty state */
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.secondary, marginTop: 12 },
    emptySubtitle: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 4 },

    /* Service cards */
    card: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
    },
    cardImage: {
        width: '100%',
        height: 160,
    },
    cardBody: { padding: 20 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(162,210,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryBadge: {
        backgroundColor: COLORS.secondaryContainer,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    categoryBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.onSecondaryContainer, textTransform: 'uppercase', letterSpacing: 1 },
    cardTitle: { fontSize: 20, fontWeight: '800', color: COLORS.secondary, marginBottom: 6 },
    cardDescription: { fontSize: 13, color: COLORS.onSurfaceVariant, lineHeight: 20 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: COLORS.surfaceContainerLow,
    },
    priceText: { fontSize: 22, fontWeight: '800', color: COLORS.secondary },
    availableBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
    availableText: { fontSize: 12, fontWeight: '700', color: '#10b981' },
});
