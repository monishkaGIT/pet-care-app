import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Switch,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SHADOWS } from '../../constants/theme';
import { createService, updateService } from '../../api/serviceApi';

const CATEGORY_OPTIONS = ['Grooming', 'Boarding', 'Medical Care', 'Training', 'Walking'];

export default function AddNewServiceScreen({ navigation, route }) {
    // Pre-fill fields when editing an existing service
    const existingService = route?.params?.service ?? null;

    const [serviceName, setServiceName] = useState(existingService?.name || '');
    const [selectedCategory, setSelectedCategory] = useState(existingService?.category || 'Boarding');
    const [price, setPrice] = useState(existingService?.price?.toString() || '');
    const [description, setDescription] = useState(existingService?.description || '');
    const [isActive, setIsActive] = useState(existingService?.isActive ?? true);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [imageUri, setImageUri] = useState(existingService?.imageUrl || null);
    const [imageFile, setImageFile] = useState(null); // The actual file object for upload
    const [imageRemoved, setImageRemoved] = useState(false); // Track if user explicitly removed the image
    const [imageLoading, setImageLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Field-level errors
    const [errors, setErrors] = useState({});

    // ── Image Picker ────────────────────────────────────────────────
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your photo library to upload a service image.',
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            setImageUri(asset.uri);
            // Prepare file object for FormData upload
            setImageFile({
                uri: asset.uri,
                type: asset.mimeType || 'image/jpeg',
                name: asset.fileName || `service_${Date.now()}.jpg`,
            });
            setImageRemoved(false); // Reset remove flag since new image was picked
            // Clear image error
            setErrors((prev) => ({ ...prev, image: null }));
        }
    };

    const removeImage = () => {
        Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    setImageUri(null);
                    setImageFile(null);
                    setImageRemoved(true);
                },
            },
        ]);
    };

    // ── Client-Side Validation ──────────────────────────────────────
    const validate = () => {
        const newErrors = {};

        if (!serviceName.trim()) {
            newErrors.name = 'Service name is required';
        } else if (serviceName.trim().length < 3) {
            newErrors.name = 'Service name must be at least 3 characters';
        }

        if (!description.trim()) {
            newErrors.description = 'Description is required';
        } else if (description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters';
        }

        const priceNum = parseFloat(price);
        if (!price || price.trim() === '') {
            newErrors.price = 'Price is required';
        } else if (isNaN(priceNum)) {
            newErrors.price = 'Price must be a valid number';
        } else if (priceNum < 0) {
            newErrors.price = 'Price cannot be negative';
        }

        // Image is required for new services.
        // For edits: required if the user explicitly removed the existing image without picking a new one.
        if (!imageUri) {
            if (!existingService || imageRemoved) {
                newErrors.image = 'Please upload a service image';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Save Handler ────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            const serviceData = {
                name: serviceName.trim(),
                category: selectedCategory,
                description: description.trim(),
                price: parseFloat(price),
                isActive,
            };

            // Attach image only if a new one was picked
            if (imageFile) {
                serviceData.image = imageFile;
            }

            // Signal backend to remove old image if user explicitly cleared it
            if (imageRemoved && !imageFile) {
                serviceData.removeImage = true;
            }

            if (existingService?._id) {
                // Update existing service
                await updateService(existingService._id, serviceData);
                Alert.alert('Success', `Service "${serviceName}" updated successfully!`, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                // Create new service
                if (!imageFile) {
                    Alert.alert('Validation', 'Please upload a service image.');
                    setSaving(false);
                    return;
                }
                await createService(serviceData);
                Alert.alert('Success', `Service "${serviceName}" created successfully!`, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            const apiErrors = error.response?.data?.errors;
            if (apiErrors && Array.isArray(apiErrors)) {
                // Map API errors to field-level errors
                const fieldErrors = {};
                apiErrors.forEach((e) => {
                    fieldErrors[e.field] = e.message;
                });
                setErrors(fieldErrors);
                Alert.alert('Validation Failed', apiErrors.map(e => e.message).join('\n'));
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Failed to save service');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* ── Top App Bar ── */}
            <View style={[styles.topBar, SHADOWS.editorial]}>
                <View style={styles.topBarLeft}>
                    <View style={styles.avatarCircle}>
                        <MaterialIcons name="person" size={20} color={COLORS.onPrimaryContainer} />
                    </View>
                    <Text style={styles.topBarTitle}>PetCare Admin</Text>
                </View>
                <TouchableOpacity activeOpacity={0.7}>
                    <MaterialIcons name="settings" size={22} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* ── Back link ── */}
                    <TouchableOpacity
                        style={styles.breadcrumb}
                        activeOpacity={0.7}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={16} color={COLORS.secondary} />
                        <Text style={styles.breadcrumbText}>Back to Services</Text>
                    </TouchableOpacity>

                    {/* ── Hero ── */}
                    <View style={styles.hero}>
                        <Text style={styles.heroTitle}>
                            {existingService ? 'Edit Service Details' : 'Add New Service'}
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            Refine the offerings for your pet sanctuary. Every detail helps pet parents feel at home.
                        </Text>
                    </View>

                    {/* ── Form Card ── */}
                    <View style={[styles.formCard, SHADOWS.editorial]}>
                        {/* ── Service Image Upload ── */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Service Image</Text>
                            {imageUri ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={styles.imagePreview}
                                        onLoadStart={() => setImageLoading(true)}
                                        onLoadEnd={() => setImageLoading(false)}
                                    />
                                    {imageLoading && (
                                        <View style={styles.imageLoadingOverlay} pointerEvents="none">
                                            <ActivityIndicator size="large" color={COLORS.primary} />
                                        </View>
                                    )}
                                    {/* Remove button */}
                                    <TouchableOpacity
                                        style={styles.removeImageBtn}
                                        activeOpacity={0.8}
                                        onPress={removeImage}
                                    >
                                        <MaterialIcons name="close" size={18} color="#fff" />
                                    </TouchableOpacity>
                                    {/* Change image button */}
                                    <TouchableOpacity
                                        style={styles.changeImageBtn}
                                        activeOpacity={0.8}
                                        onPress={pickImage}
                                    >
                                        <MaterialIcons name="camera-alt" size={16} color="#fff" />
                                        <Text style={styles.changeImageBtnText}>Change</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.uploadArea, errors.image && styles.uploadAreaError]}
                                    activeOpacity={0.7}
                                    onPress={pickImage}
                                >
                                    <View style={styles.uploadIconCircle}>
                                        <MaterialIcons name="cloud-upload" size={32} color={COLORS.primary} />
                                    </View>
                                    <Text style={styles.uploadTitle}>Tap to Upload Service Image</Text>
                                    <Text style={styles.uploadSubtitle}>
                                        JPG, PNG or WEBP • Max 5 MB
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
                        </View>

                        {/* Service Name */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Service Name</Text>
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                placeholder="e.g., Luxury Dog Boarding"
                                placeholderTextColor={COLORS.outlineVariant}
                                value={serviceName}
                                onChangeText={(v) => { setServiceName(v); setErrors((p) => ({ ...p, name: null })); }}
                            />
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        {/* Category + Price row */}
                        <View style={styles.rowFields}>
                            {/* Category */}
                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Category</Text>
                                <TouchableOpacity
                                    style={styles.selectButton}
                                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.selectButtonText}>{selectedCategory}</Text>
                                    <MaterialIcons name="expand-more" size={22} color={COLORS.secondary} />
                                </TouchableOpacity>
                                {showCategoryPicker && (
                                    <View style={styles.pickerDropdown}>
                                        {CATEGORY_OPTIONS.map((cat) => (
                                            <TouchableOpacity
                                                key={cat}
                                                style={[
                                                    styles.pickerItem,
                                                    selectedCategory === cat && styles.pickerItemActive,
                                                ]}
                                                onPress={() => {
                                                    setSelectedCategory(cat);
                                                    setShowCategoryPicker(false);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.pickerItemText,
                                                        selectedCategory === cat && styles.pickerItemTextActive,
                                                    ]}
                                                >
                                                    {cat}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Price */}
                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Price per Session ($)</Text>
                                <View style={styles.priceInputWrapper}>
                                    <Text style={styles.dollarSign}>$</Text>
                                    <TextInput
                                        style={[styles.input, { paddingLeft: 30 }, errors.price && styles.inputError]}
                                        placeholder="0.00"
                                        placeholderTextColor={COLORS.outlineVariant}
                                        keyboardType="decimal-pad"
                                        value={price}
                                        onChangeText={(v) => { setPrice(v); setErrors((p) => ({ ...p, price: null })); }}
                                    />
                                </View>
                                {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                            </View>
                        </View>

                        {/* Description */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                                placeholder="Describe the premium experience the pet will receive..."
                                placeholderTextColor={COLORS.outlineVariant}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={description}
                                onChangeText={(v) => { setDescription(v); setErrors((p) => ({ ...p, description: null })); }}
                            />
                            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                        </View>

                        {/* Availability Toggle */}
                        <View style={styles.toggleCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.toggleTitle}>Availability Status</Text>
                                <Text style={styles.toggleSubtitle}>
                                    Toggle visibility of this service on the client app.
                                </Text>
                            </View>
                            <View style={styles.toggleRow}>
                                <Text style={[styles.toggleLabel, !isActive && { fontWeight: '800' }]}>
                                    Inactive
                                </Text>
                                <Switch
                                    value={isActive}
                                    onValueChange={setIsActive}
                                    trackColor={{ false: COLORS.surfaceContainerHighest, true: COLORS.primary }}
                                    thumbColor="#fff"
                                />
                                <Text style={[styles.toggleLabel, isActive && { fontWeight: '800', color: COLORS.primary }]}>
                                    Active
                                </Text>
                            </View>
                        </View>

                        {/* ── Action Buttons ── */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                activeOpacity={0.7}
                                onPress={() => navigation.goBack()}
                                disabled={saving}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, saving && { opacity: 0.6 }]}
                                activeOpacity={0.85}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>
                                        {existingService ? 'Update Service' : 'Save Service'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    /* Top bar */
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 14,
        backgroundColor: COLORS.surfaceContainerLow,
    },
    topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topBarTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary, letterSpacing: -0.3 },

    scrollContent: { paddingHorizontal: 24, paddingBottom: 48 },

    /* Breadcrumb */
    breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24, marginBottom: 24 },
    breadcrumbText: { fontSize: 13, fontWeight: '600', color: COLORS.secondary, letterSpacing: 0.3 },

    /* Hero */
    hero: { marginBottom: 28 },
    heroTitle: { fontSize: 30, fontWeight: '800', color: COLORS.secondary, letterSpacing: -0.4 },
    heroSubtitle: { fontSize: 14, color: COLORS.onSurfaceVariant, marginTop: 6, lineHeight: 21, maxWidth: '90%' },

    /* Form card */
    formCard: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 20,
        padding: 28,
    },

    /* Image upload area */
    uploadArea: {
        borderWidth: 2,
        borderColor: COLORS.outlineVariant,
        borderStyle: 'dashed',
        borderRadius: 16,
        paddingVertical: 36,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surfaceContainerLow,
    },
    uploadAreaError: {
        borderColor: COLORS.error,
    },
    uploadIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    uploadTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.secondary,
        marginBottom: 4,
    },
    uploadSubtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.outlineVariant,
    },

    /* Image preview */
    imagePreviewContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 16,
    },
    imageLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    removeImageBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        elevation: 10,
    },
    changeImageBtn: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        zIndex: 10,
        elevation: 10,
    },
    changeImageBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },

    fieldGroup: { marginBottom: 22 },
    label: { fontSize: 13, fontWeight: '700', color: COLORS.secondary, marginBottom: 8, marginLeft: 2 },
    input: {
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 15,
        color: COLORS.onSurfaceVariant,
        fontWeight: '500',
    },
    inputError: {
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    errorText: {
        fontSize: 12,
        color: COLORS.error,
        marginTop: 4,
        marginLeft: 2,
        fontWeight: '600',
    },
    textArea: { minHeight: 110, paddingTop: 16 },

    rowFields: { flexDirection: 'row', gap: 14 },

    /* Select dropdown */
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surfaceContainerLow,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    selectButtonText: { fontSize: 15, color: COLORS.onSurfaceVariant, fontWeight: '500' },
    pickerDropdown: {
        backgroundColor: COLORS.surfaceContainerLowest,
        borderRadius: 12,
        marginTop: 6,
        ...SHADOWS.editorial,
        overflow: 'hidden',
    },
    pickerItem: { paddingVertical: 13, paddingHorizontal: 20 },
    pickerItemActive: { backgroundColor: COLORS.primaryContainer },
    pickerItemText: { fontSize: 14, color: COLORS.onSurfaceVariant, fontWeight: '500' },
    pickerItemTextActive: { color: COLORS.primary, fontWeight: '700' },

    /* Price input */
    priceInputWrapper: { position: 'relative' },
    dollarSign: {
        position: 'absolute',
        left: 20,
        top: 16,
        zIndex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.secondary,
    },

    /* Toggle */
    toggleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceContainer,
        borderRadius: 14,
        padding: 20,
        marginBottom: 22,
        gap: 12,
    },
    toggleTitle: { fontSize: 15, fontWeight: '700', color: COLORS.secondary },
    toggleSubtitle: { fontSize: 11, color: COLORS.onSurfaceVariant, marginTop: 2 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    toggleLabel: { fontSize: 12, fontWeight: '600', color: COLORS.onSurfaceVariant },

    /* Action buttons */
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.surfaceContainerHigh,
    },
    cancelButton: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: COLORS.surfaceContainerHighest,
    },
    cancelButtonText: { fontWeight: '700', color: COLORS.secondary, fontSize: 14 },
    saveButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 999,
        backgroundColor: COLORS.primary,
        ...SHADOWS.button,
    },
    saveButtonText: { fontWeight: '700', color: '#fff', fontSize: 14 },
});
