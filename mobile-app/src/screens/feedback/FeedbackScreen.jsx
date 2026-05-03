import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, Modal, ActivityIndicator, KeyboardAvoidingView,
    Platform, ScrollView, Animated, RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { AuthContext } from '../../context/AuthContext';
import {
    fetchUserFeedbacks,
    createFeedback,
    updateFeedback,
    deleteFeedback,
} from '../../api/feedbackApi';
import PetCareModal from '../../components/PetCareModal';
import usePetCareModal from '../../hooks/usePetCareModal';

const CATEGORIES = ['General', 'Bug Report', 'Feature Request', 'Compliment', 'Other'];

const CATEGORY_ICONS = {
    'General': 'chat-bubble-outline',
    'Bug Report': 'bug-report',
    'Feature Request': 'lightbulb-outline',
    'Compliment': 'thumb-up',
    'Other': 'more-horiz',
};

const CATEGORY_COLORS = {
    'General': '#30628a',
    'Bug Report': '#ba1a1a',
    'Feature Request': '#8e4e14',
    'Compliment': '#10b981',
    'Other': '#72787f',
};

export default function FeedbackScreen() {
    const { user } = useContext(AuthContext);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [modalProps, showModal] = usePetCareModal();

    // Form state
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('General');
    const [rating, setRating] = useState(5);

    const fadeAnim = useState(new Animated.Value(0))[0];

    const loadFeedbacks = useCallback(async () => {
        try {
            const data = await fetchUserFeedbacks();
            setFeedbacks(data);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            showModal('error', 'Error', 'Failed to load feedbacks');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadFeedbacks();
    }, [loadFeedbacks]);

    const onRefresh = () => {
        setRefreshing(true);
        loadFeedbacks();
    };

    const resetForm = () => {
        setTitle('');
        setMessage('');
        setCategory('General');
        setRating(5);
        setEditingFeedback(null);
    };

    const openCreateModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (fb) => {
        setEditingFeedback(fb);
        setTitle(fb.title);
        setMessage(fb.message);
        setCategory(fb.category);
        setRating(fb.rating);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            showModal('warning', 'Missing Title', 'Please enter a title for your feedback.');
            return;
        }
        if (title.trim().length < 3) {
            showModal('warning', 'Title Too Short', 'Title must be at least 3 characters.');
            return;
        }
        if (!message.trim()) {
            showModal('warning', 'Missing Message', 'Please enter your feedback message.');
            return;
        }
        if (message.trim().length < 10) {
            showModal('warning', 'Message Too Short', 'Please provide at least 10 characters of feedback.');
            return;
        }

        setSubmitting(true);
        try {
            const feedbackData = {
                title: title.trim(),
                message: message.trim(),
                category,
                rating,
                userName: user?.name || user?.email || 'Anonymous',
            };

            if (editingFeedback) {
                await updateFeedback(editingFeedback._id, feedbackData);
                showModal('success', 'Success', 'Feedback updated successfully!');
            } else {
                await createFeedback(feedbackData);
                showModal('success', 'Success', 'Feedback submitted successfully!');
            }

            setModalVisible(false);
            resetForm();
            loadFeedbacks();
        } catch (error) {
            showModal('error', 'Error', error.response?.data?.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (fb) => {
        showModal('warning', 'Delete Feedback', `Are you sure you want to delete "${fb.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteFeedback(fb._id);
                        loadFeedbacks();
                    } catch (error) {
                        showModal('error', 'Error', 'Failed to delete feedback');
                    }
                },
            },
        ]);
    };

    const renderStars = (count, interactive = false, size = 18) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    disabled={!interactive}
                    onPress={() => interactive && setRating(i)}
                    activeOpacity={interactive ? 0.6 : 1}
                >
                    <MaterialIcons
                        name={i <= count ? 'star' : 'star-border'}
                        size={size}
                        color={i <= count ? '#f59e0b' : COLORS.outlineVariant}
                        style={{ marginRight: 2 }}
                    />
                </TouchableOpacity>
            );
        }
        return <View style={{ flexDirection: 'row', alignItems: 'center' }}>{stars}</View>;
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const renderFeedbackCard = ({ item, index }) => (
        <Animated.View
            style={[
                styles.card,
                {
                    opacity: fadeAnim,
                    transform: [{
                        translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                        }),
                    }],
                },
            ]}
        >
            {/* Category Badge + Date */}
            <View style={styles.cardHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[item.category] + '18' }]}>
                    <MaterialIcons
                        name={CATEGORY_ICONS[item.category]}
                        size={14}
                        color={CATEGORY_COLORS[item.category]}
                    />
                    <Text style={[styles.categoryText, { color: CATEGORY_COLORS[item.category] }]}>
                        {item.category}
                    </Text>
                </View>
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>

            {/* Title + Rating */}
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={{ marginTop: 4, marginBottom: 8 }}>
                {renderStars(item.rating)}
            </View>

            {/* Message */}
            <Text style={styles.cardMessage} numberOfLines={3}>{item.message}</Text>

            {/* Actions */}
            <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)} activeOpacity={0.7}>
                    <MaterialIcons name="edit" size={16} color={COLORS.primary} />
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)} activeOpacity={0.7}>
                    <MaterialIcons name="delete-outline" size={16} color={COLORS.error} />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
                <MaterialIcons name="rate-review" size={56} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Feedback Yet</Text>
            <Text style={styles.emptySubtitle}>
                Share your thoughts, report bugs,{'\n'}or request new features!
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openCreateModal} activeOpacity={0.8}>
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Write Your First Feedback</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loaderText}>Loading feedbacks...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>My Feedback</Text>
                        <Text style={styles.headerSubtitle}>
                            {feedbacks.length} {feedbacks.length === 1 ? 'entry' : 'entries'}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={openCreateModal} activeOpacity={0.8}>
                        <MaterialIcons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Feedback List */}
            <FlatList
                data={feedbacks}
                keyExtractor={(item) => item._id}
                renderItem={renderFeedbackCard}
                contentContainerStyle={feedbacks.length === 0 ? styles.emptyListContainer : styles.listContent}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            />

            {/* Create / Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setModalVisible(false);
                    resetForm();
                }}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalKeyboard}
                    >
                        <View style={styles.modalContainer}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingFeedback ? 'Edit Feedback' : 'New Feedback'}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(false);
                                        resetForm();
                                    }}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                                {/* Category Selector */}
                                <Text style={styles.label}>Category</Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.categoryScroll}
                                >
                                    {CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.categoryChip,
                                                category === cat && styles.categoryChipActive,
                                                category === cat && { backgroundColor: CATEGORY_COLORS[cat] },
                                            ]}
                                            onPress={() => setCategory(cat)}
                                            activeOpacity={0.7}
                                        >
                                            <MaterialIcons
                                                name={CATEGORY_ICONS[cat]}
                                                size={16}
                                                color={category === cat ? '#fff' : COLORS.onSurfaceVariant}
                                            />
                                            <Text
                                                style={[
                                                    styles.categoryChipText,
                                                    category === cat && styles.categoryChipTextActive,
                                                ]}
                                            >
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Rating */}
                                <Text style={styles.label}>Rating</Text>
                                <View style={styles.ratingContainer}>
                                    {renderStars(rating, true, 32)}
                                    <Text style={styles.ratingValueText}>{rating}/5</Text>
                                </View>

                                {/* Title Input */}
                                <Text style={styles.label}>Title</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Brief summary of your feedback..."
                                    placeholderTextColor={COLORS.textPlaceholder}
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={100}
                                />
                                <Text style={styles.charCount}>{title.length}/100</Text>

                                {/* Message Input */}
                                <Text style={styles.label}>Message</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Describe your feedback in detail..."
                                    placeholderTextColor={COLORS.textPlaceholder}
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    maxLength={500}
                                />
                                <Text style={styles.charCount}>{message.length}/500</Text>
                            </ScrollView>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                                onPress={handleSubmit}
                                disabled={submitting}
                                activeOpacity={0.8}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <MaterialIcons
                                            name={editingFeedback ? 'check' : 'send'}
                                            size={20}
                                            color="#fff"
                                        />
                                        <Text style={styles.submitButtonText}>
                                            {editingFeedback ? 'Update Feedback' : 'Submit Feedback'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Alert / Confirm modal */}
            <PetCareModal {...modalProps} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // ── Loader ──
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loaderText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textSecondary,
    },

    // ── Header ──
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: Platform.OS === 'ios' ? 56 : 44,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...SHADOWS.header,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
        fontWeight: '500',
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },

    // ── List ──
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    emptyListContainer: {
        flexGrow: 1,
    },

    // ── Card ──
    card: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.outlineVariant + '60',
        ...SHADOWS.card,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    dateText: {
        fontSize: 11,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.onSurface,
        letterSpacing: 0.1,
    },
    cardMessage: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 14,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.outlineVariant + '40',
        paddingTop: 12,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: COLORS.primaryContainer + '40',
        gap: 4,
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: COLORS.errorContainer + '40',
        gap: 4,
    },
    deleteButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.error,
    },

    // ── Empty State ──
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primaryContainer + '30',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.onSurface,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 24,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 28,
        gap: 8,
        ...SHADOWS.button,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },

    // ── Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalKeyboard: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.outlineVariant + '40',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.onSurface,
    },
    modalScroll: {
        marginTop: 8,
    },

    // ── Form ──
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.onSurface,
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    categoryScroll: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.surfaceContainerHigh,
        marginRight: 8,
        gap: 6,
        borderWidth: 1,
        borderColor: COLORS.outlineVariant + '60',
    },
    categoryChipActive: {
        borderColor: 'transparent',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.onSurfaceVariant,
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: COLORS.surfaceContainerLow,
        padding: 12,
        borderRadius: 12,
    },
    ratingValueText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#f59e0b',
    },
    input: {
        backgroundColor: COLORS.inputBg,
        borderWidth: 1.5,
        borderColor: COLORS.inputBorder,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: COLORS.onSurface,
    },
    textArea: {
        minHeight: 110,
    },
    charCount: {
        fontSize: 11,
        color: COLORS.textMuted,
        textAlign: 'right',
        marginTop: 4,
    },

    // ── Submit ──
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 16,
        gap: 8,
        ...SHADOWS.button,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
