import React, { useState, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    TextInput, Alert, ScrollView, Image, ActivityIndicator,
    Platform, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { postApi } from '../../api/axiosConfig';
import { AuthContext } from '../../context/AuthContext';

// TODO: When Cloudinary is configured, import uploadToCloudinary here:
// import { uploadToCloudinary } from '../../utils/uploadImage';

export default function EditPostScreen({ navigation, route }) {
    // post object passed from SocialScreen via navigation.navigate('EditPost', { post })
    const { post } = route.params;
    const { user } = useContext(AuthContext);

    const [caption, setCaption] = useState(post.caption || '');
    const [label, setLabel] = useState(post.label || '');
    const [imageUri, setImageUri] = useState(post.image || null);
    const [imageBase64, setImageBase64] = useState('');
    const [loading, setLoading] = useState(false);

    const SUGGESTED_LABELS = ['Garden Vibes', 'Beach Day', 'Park Fun', 'Lazy Day', 'Play Time'];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.6,
            base64: true,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSave = async () => {
        if (!caption.trim()) {
            Alert.alert('Missing Caption', 'Please write something for your post.');
            return;
        }
        if (caption.trim().length < 3) {
            Alert.alert('Caption Too Short', 'Caption must be at least 3 characters.');
            return;
        }
        if (caption.trim().length > 500) {
            Alert.alert('Caption Too Long', 'Caption must be under 500 characters.');
            return;
        }

        setLoading(true);
        try {
            let imageUrl = imageUri || '';

            // If a new image was picked (has new base64), upload it
            if (imageBase64) {
                // TODO: Replace with Cloudinary upload when credentials are configured.
                // ─── Cloudinary upload (uncomment when credentials are added) ───────
                // imageUrl = await uploadToCloudinary(imageBase64);
                // ────────────────────────────────────────────────────────────────────
                //
                // For now: store base64 directly
                imageUrl = imageBase64;
            }

            await postApi.put(`/${post._id}`, {
                caption: caption.trim(),
                image: imageUrl,
                label: label.trim(),
            });

            Alert.alert('Saved! ✅', 'Your post has been updated.');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', err?.response?.data?.message || 'Could not update post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                    <MaterialIcons name="close" size={26} color="#30628a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Post</Text>
                <TouchableOpacity
                    style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                    activeOpacity={0.85}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator size="small" color="#ffffff" />
                        : <Text style={styles.saveBtnText}>SAVE</Text>
                    }
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Composer */}
                <View style={styles.composerCard}>
                    <TextInput
                        style={styles.composerInput}
                        placeholder="Edit your caption..."
                        placeholderTextColor="#c1c7cf"
                        multiline
                        value={caption}
                        onChangeText={setCaption}
                        maxLength={500}
                        autoFocus
                    />

                    {/* Image preview / replace */}
                    <TouchableOpacity style={styles.photoSlot} onPress={pickImage} activeOpacity={0.8}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.previewImage} />
                        ) : (
                            <>
                                <MaterialIcons name="add-photo-alternate" size={32} color="#30628a" />
                                <Text style={styles.photoSlotText}>Add Photo</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    {imageUri && (
                        <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
                            <MaterialIcons name="swap-horiz" size={14} color="#30628a" />
                            <Text style={styles.changePhotoText}>Change photo</Text>
                        </TouchableOpacity>
                    )}

                    {/* Label */}
                    <View style={styles.labelRow}>
                        <MaterialIcons name="local-offer" size={18} color="#f59e0b" />
                        <TextInput
                            style={styles.labelInput}
                            placeholder="Vibe label (e.g. Beach Day)"
                            placeholderTextColor="#c1c7cf"
                            value={label}
                            onChangeText={setLabel}
                            maxLength={40}
                        />
                    </View>

                    {/* Suggested labels */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
                        {SUGGESTED_LABELS.map(tag => (
                            <TouchableOpacity
                                key={tag}
                                style={[styles.hashtagChip, label === tag && styles.hashtagChipActive]}
                                onPress={() => setLabel(tag)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.hashtagText, label === tag && styles.hashtagTextActive]}>
                                    #{tag}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Pet tag (display only — can't change pet on edit) */}
                {post.pet && (
                    <View style={styles.petInfo}>
                        <MaterialIcons name="pets" size={16} color="#79573f" />
                        <Text style={styles.petInfoText}>
                            Tagged: <Text style={styles.petInfoName}>{post.pet?.name}</Text>
                        </Text>
                    </View>
                )}

                {/* Danger zone */}
                <View style={styles.dangerSection}>
                    <Text style={styles.dangerLabel}>DANGER ZONE</Text>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        activeOpacity={0.8}
                        onPress={() =>
                            Alert.alert(
                                'Delete Post',
                                'This will permanently delete your post.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Delete', style: 'destructive',
                                        onPress: async () => {
                                            try {
                                                await postApi.delete(`/${post._id}`);
                                                navigation.goBack();
                                            } catch {
                                                Alert.alert('Error', 'Could not delete post');
                                            }
                                        },
                                    },
                                ]
                            )
                        }
                    >
                        <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                        <Text style={styles.deleteBtnText}>Delete This Post</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },

    header: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 10, paddingBottom: 18,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: 'rgba(111,78,55,0.08)',
        shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 1, elevation: 4,
    },
    closeBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#30628a' },
    saveBtn: {
        backgroundColor: '#f59e0b', paddingVertical: 9, paddingHorizontal: 22,
        borderRadius: 20, minWidth: 64, alignItems: 'center',
        shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
    },
    saveBtnDisabled: { opacity: 0.6 },
    saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },

    composerCard: {
        backgroundColor: '#faf3e0',
        borderRadius: 28, marginHorizontal: 16, marginTop: 24, padding: 20,
        shadowColor: 'rgba(111,78,55,0.08)',
        shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 1, elevation: 2,
    },
    composerInput: {
        fontSize: 17, color: '#1e1c10', minHeight: 90,
        textAlignVertical: 'top', lineHeight: 26,
    },
    photoSlot: {
        width: 100, height: 100, borderRadius: 16,
        backgroundColor: 'rgba(162,210,255,0.2)',
        borderWidth: 2, borderColor: 'rgba(162,210,255,0.4)', borderStyle: 'dashed',
        alignItems: 'center', justifyContent: 'center', marginTop: 12, overflow: 'hidden',
    },
    previewImage: { width: '100%', height: '100%' },
    photoSlotText: { fontSize: 11, color: '#30628a', fontWeight: '600', marginTop: 4 },
    changePhotoBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-start',
    },
    changePhotoText: { fontSize: 12, color: '#30628a', fontWeight: '600' },
    labelRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginTop: 16, paddingTop: 14,
        borderTopWidth: 1, borderTopColor: 'rgba(193,199,207,0.2)',
    },
    labelInput: { flex: 1, fontSize: 14, color: '#1e1c10' },
    tagsScroll: { marginTop: 12 },
    hashtagChip: {
        backgroundColor: 'rgba(162,210,255,0.3)',
        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 8,
    },
    hashtagChipActive: { backgroundColor: '#f59e0b' },
    hashtagText: { color: '#30628a', fontWeight: 'bold', fontSize: 12 },
    hashtagTextActive: { color: '#ffffff' },

    petInfo: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginHorizontal: 16, marginTop: 20,
        backgroundColor: '#efe8d5', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16,
    },
    petInfoText: { fontSize: 14, color: '#41474e' },
    petInfoName: { fontWeight: 'bold', color: '#79573f' },

    dangerSection: { marginHorizontal: 16, marginTop: 28 },
    dangerLabel: {
        fontSize: 10, fontWeight: 'bold', color: '#72787f',
        letterSpacing: 2, marginBottom: 10,
    },
    deleteBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#fff',
        borderWidth: 1.5, borderColor: '#ef4444', borderRadius: 14,
        paddingVertical: 14, paddingHorizontal: 20,
    },
    deleteBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 15 },
});
