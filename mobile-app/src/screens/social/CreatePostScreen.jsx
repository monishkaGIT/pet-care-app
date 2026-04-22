import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    TextInput, Alert, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { petApi, postApi } from '../../api/axiosConfig';

// TODO: When Cloudinary is configured, import uploadToCloudinary here:
// import { uploadToCloudinary } from '../../utils/uploadImage';

export default function CreatePostScreen({ navigation }) {
    const { user } = useContext(AuthContext);

    const [caption, setCaption] = useState('');
    const [label, setLabel] = useState('');
    const [selectedPet, setSelectedPet] = useState(null);
    const [pets, setPets] = useState([]);
    const [imageUri, setImageUri] = useState(null);    // local preview URI
    const [imageBase64, setImageBase64] = useState(''); // base64 for upload
    const [loading, setLoading] = useState(false);
    const [petsLoading, setPetsLoading] = useState(true);

    const SUGGESTED_LABELS = ['#Garden Vibes', '#Beach Day', '#Park Fun', '#Lazy Day', '#Play Time'];

    // Load user's pets for the pet selector
    useEffect(() => {
        petApi.get('/')
            .then(({ data }) => setPets(data))
            .catch(() => {})
            .finally(() => setPetsLoading(false));
    }, []);

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

    const handlePost = async () => {
        if (!caption.trim()) {
            Alert.alert('Missing caption', 'Please write something for your post.');
            return;
        }

        setLoading(true);
        try {
            let imageUrl = '';

            if (imageBase64) {
                // TODO: Replace the block below with Cloudinary upload when configured.
                // ─── Cloudinary upload (uncomment when credentials are added) ───────
                // imageUrl = await uploadToCloudinary(imageBase64);
                // ────────────────────────────────────────────────────────────────────
                //
                // For now, store base64 directly (works but is large):
                imageUrl = imageBase64;
            }

            await postApi.post('/', {
                caption: caption.trim(),
                image: imageUrl,
                label: label.trim(),
                pet: selectedPet?._id || null,
            });

            Alert.alert('Posted! 🐾', 'Your post has been shared.');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', err?.response?.data?.message || 'Could not create post');
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
                <Text style={styles.headerTitle}>Create Post</Text>
                <TouchableOpacity
                    style={[styles.postBtn, loading && styles.postBtnDisabled]}
                    activeOpacity={0.85}
                    onPress={handlePost}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator size="small" color="#ffffff" />
                        : <Text style={styles.postBtnText}>POST</Text>
                    }
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* User row */}
                <View style={styles.userRow}>
                    <View style={styles.userAvatar}>
                        {user?.profileImage ? (
                            <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
                        ) : (
                            <MaterialIcons name="person" size={22} color="#30628a" />
                        )}
                    </View>
                    <Text style={styles.userName}>{user?.name || 'Pet Parent'}</Text>
                </View>

                {/* Composer */}
                <View style={styles.composerCard}>
                    <TextInput
                        style={styles.composerInput}
                        placeholder="What's happening in your pet's world? 🐾"
                        placeholderTextColor="#c1c7cf"
                        multiline
                        value={caption}
                        onChangeText={setCaption}
                        maxLength={500}
                    />

                    {/* Image preview / picker */}
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
                        <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImageUri(null); setImageBase64(''); }}>
                            <MaterialIcons name="close" size={14} color="#ef4444" />
                            <Text style={styles.removeImageText}>Remove photo</Text>
                        </TouchableOpacity>
                    )}

                    {/* Label input */}
                    <View style={styles.labelRow}>
                        <MaterialIcons name="local-offer" size={18} color="#f59e0b" />
                        <TextInput
                            style={styles.labelInput}
                            placeholder="Add a vibe label... (e.g. Beach Day)"
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
                                style={styles.hashtagChip}
                                onPress={() => setLabel(tag.replace('#', ''))}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.hashtagText}>{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Pet Selection */}
                <View style={styles.petSection}>
                    <View style={styles.petSectionHeader}>
                        <Text style={styles.petSectionTitle}>TAG A PET</Text>
                        <Text style={styles.petSectionHint}>Optional</Text>
                    </View>

                    {petsLoading ? (
                        <ActivityIndicator size="small" color="#a2d2ff" style={{ marginTop: 8 }} />
                    ) : pets.length === 0 ? (
                        <Text style={styles.noPetsText}>No pets found. Add a pet first.</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.petChipsRow}>
                                {/* None option */}
                                <TouchableOpacity
                                    style={[styles.petChip, !selectedPet && styles.petChipActive]}
                                    onPress={() => setSelectedPet(null)}
                                    activeOpacity={0.8}
                                >
                                    <MaterialIcons name="close" size={14} color={!selectedPet ? '#ffffff' : '#79573f'} />
                                    <Text style={[styles.petChipText, !selectedPet && styles.petChipTextActive]}>None</Text>
                                </TouchableOpacity>

                                {pets.map(pet => (
                                    <TouchableOpacity
                                        key={pet._id}
                                        style={[styles.petChip, selectedPet?._id === pet._id && styles.petChipActive]}
                                        onPress={() => setSelectedPet(pet)}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialIcons
                                            name="pets"
                                            size={14}
                                            color={selectedPet?._id === pet._id ? '#ffffff' : '#79573f'}
                                        />
                                        <Text style={[styles.petChipText, selectedPet?._id === pet._id && styles.petChipTextActive]}>
                                            {pet.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    )}
                </View>

                {/* Extra options */}
                <View style={styles.toolSection}>
                    {[
                        { icon: 'location-on', label: 'Add Location' },
                        { icon: 'person-add', label: 'Tag Friends' },
                        { icon: 'public', label: 'Audience: Everyone' },
                    ].map((item, i) => (
                        <TouchableOpacity key={i} style={styles.toolRow} activeOpacity={0.8}>
                            <MaterialIcons name={item.icon} size={22} color="#30628a" />
                            <Text style={styles.toolLabel}>{item.label}</Text>
                            <MaterialIcons name="chevron-right" size={20} color="#c1c7cf" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>
                    ))}
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
        paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18,
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
    postBtn: {
        backgroundColor: '#f59e0b', paddingVertical: 9, paddingHorizontal: 22,
        borderRadius: 20,
        shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
        minWidth: 64, alignItems: 'center',
    },
    postBtnDisabled: { opacity: 0.6 },
    postBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },

    // User row
    userRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
    },
    userAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(162,210,255,0.3)',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    },
    avatarImg: { width: '100%', height: '100%' },
    userName: { fontSize: 15, fontWeight: 'bold', color: '#79573f' },

    // Composer
    composerCard: {
        backgroundColor: '#faf3e0',
        borderRadius: 28, marginHorizontal: 16, marginTop: 8, padding: 20,
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
    removeImageBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        marginTop: 6, alignSelf: 'flex-start',
    },
    removeImageText: { fontSize: 12, color: '#ef4444' },
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
    hashtagText: { color: '#30628a', fontWeight: 'bold', fontSize: 12 },

    // Pet section
    petSection: { marginHorizontal: 16, marginTop: 20 },
    petSectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 12,
    },
    petSectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#79573f', letterSpacing: 2 },
    petSectionHint: { fontSize: 11, color: '#72787f' },
    noPetsText: { fontSize: 13, color: '#72787f', fontStyle: 'italic' },
    petChipsRow: { flexDirection: 'row', gap: 10 },
    petChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#efe8d5', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 22,
    },
    petChipActive: { backgroundColor: '#f59e0b' },
    petChipText: { fontSize: 14, fontWeight: '600', color: '#79573f' },
    petChipTextActive: { color: '#ffffff' },

    // Tools
    toolSection: { marginHorizontal: 16, marginTop: 20, gap: 8 },
    toolRow: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: '#ffffff', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 16,
        shadowColor: 'rgba(111,78,55,0.04)',
        shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, shadowOpacity: 1, elevation: 1,
    },
    toolLabel: { fontSize: 14, fontWeight: 'bold', color: '#79573f' },
});
