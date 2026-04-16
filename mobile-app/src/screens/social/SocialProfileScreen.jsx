import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, ActivityIndicator, Alert, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import api, { postApi } from '../../api/axiosConfig';

export default function SocialProfileScreen({ navigation }) {
    const { user, setUser, logout } = useContext(AuthContext);
    const [profileImage, setProfileImage] = useState(user?.profileImage || null);
    const [activeTab, setActiveTab] = useState('grid');
    const [loading, setLoading] = useState(false);
    const [myPosts, setMyPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);

    const fetchMyPosts = useCallback(async () => {
        try {
            const { data } = await postApi.get('/mine');
            setMyPosts(data);
        } catch {
            // silently fail — profile still works
        } finally {
            setPostsLoading(false);
        }
    }, []);

    useEffect(() => { fetchMyPosts(); }, [fetchMyPosts]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], allowsEditing: true,
            aspect: [1, 1], quality: 0.5, base64: true,
        });
        if (!result.canceled) {
            const img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setProfileImage(img);
            setLoading(true);
            try {
                const { data } = await api.put('/profile', { profileImage: img });
                setUser(data);
            } catch (e) {
                Alert.alert('Error', 'Could not update photo');
            } finally {
                setLoading(false);
            }
        }
    };

    const TABS = [
        { id: 'grid', icon: 'grid-view', label: 'GRID' },
        { id: 'tags', icon: 'assignment-ind', label: 'TAGS' },
        { id: 'saved', icon: 'bookmark', label: 'SAVED' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Top bar */}
            <View style={styles.topBar}>
                <Text style={styles.topBarBrand}>Social Feed</Text>
                <View style={styles.topBarActions}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialIcons name="add-circle-outline" size={24} color="#30628a" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialIcons name="settings" size={22} color="#30628a" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Profile section */}
                <View style={styles.profileRow}>
                    <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.85}>
                        <View style={styles.avatarRing}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatarImg} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <MaterialIcons name="person" size={52} color="#a2d2ff" />
                                </View>
                            )}
                        </View>
                        <View style={styles.editBadge}>
                            {loading
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <MaterialIcons name="edit" size={13} color="#ffffff" />
                            }
                        </View>
                    </TouchableOpacity>

                    <View style={styles.profileInfoCol}>
                        <View style={styles.nameRow}>
                            <Text style={styles.username}>{user?.name || 'Pet Parent'}</Text>
                            <TouchableOpacity style={styles.editProfileBtn}>
                                <Text style={styles.editProfileBtnText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.bio}>🐾 Proud pet parent · {user?.email}</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}><Text style={styles.statVal}>{myPosts.length}</Text><Text style={styles.statLbl}>POSTS</Text></View>
                            <View style={styles.statItem}><Text style={styles.statVal}>—</Text><Text style={styles.statLbl}>FOLLOWS</Text></View>
                            <View style={styles.statItem}><Text style={styles.statVal}>—</Text><Text style={styles.statLbl}>FOLLOWING</Text></View>
                        </View>
                    </View>
                </View>

                {/* Follow / Message CTA row */}
                <View style={styles.ctaRow}>
                    <TouchableOpacity style={styles.followBtn}>
                        <MaterialIcons name="person-add" size={18} color="#ffffff" />
                        <Text style={styles.followBtnText}>Follow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageBtn}>
                        <MaterialIcons name="chat-bubble-outline" size={18} color="#30628a" />
                        <Text style={styles.messageBtnText}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareBtn}>
                        <MaterialIcons name="share" size={20} color="#30628a" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabBar}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <MaterialIcons name={tab.icon} size={20} color={activeTab === tab.id ? '#79573f' : '#72787f'} />
                            <Text style={[styles.tabLbl, activeTab === tab.id && styles.tabLblActive]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Post Grid */}
                {postsLoading ? (
                    <ActivityIndicator size="small" color="#a2d2ff" style={{ marginTop: 20 }} />
                ) : myPosts.length === 0 ? (
                    <View style={styles.emptyGrid}>
                        <MaterialIcons name="camera-alt" size={40} color="rgba(162,210,255,0.5)" />
                        <Text style={styles.emptyGridText}>No posts yet</Text>
                    </View>
                ) : (
                    <View style={styles.postGrid}>
                        {myPosts.map((post) => (
                            <TouchableOpacity
                                key={post._id}
                                style={styles.postCell}
                                activeOpacity={0.8}
                            >
                                {post.image ? (
                                    <Image source={{ uri: post.image }} style={styles.postCellImg} />
                                ) : (
                                    <View style={[styles.postCell, { backgroundColor: '#efe8d5', margin: 0 }]}>
                                        <MaterialIcons name="pets" size={28} color="rgba(121,87,63,0.3)" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Logout */}
                <TouchableOpacity style={styles.logoutRow} onPress={logout}>
                    <MaterialIcons name="logout" size={18} color="#ba1a1a" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#efe8d5',
    },
    topBarBrand: { fontSize: 22, fontWeight: 'bold', color: '#30628a', fontStyle: 'italic' },
    topBarActions: { flexDirection: 'row', gap: 8 },
    iconBtn: { padding: 6 },
    scroll: { paddingHorizontal: 16, paddingBottom: 20 },
    profileRow: { flexDirection: 'row', gap: 18, paddingTop: 20, paddingBottom: 16 },
    avatarWrap: { position: 'relative' },
    avatarRing: {
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 3, borderColor: '#a2d2ff',
        overflow: 'hidden', backgroundColor: '#faf3e0',
    },
    avatarImg: { width: '100%', height: '100%' },
    avatarPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    editBadge: {
        position: 'absolute', bottom: 2, right: 2,
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: '#f59e0b',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#fff9ec',
    },
    profileInfoCol: { flex: 1, paddingTop: 4 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
    username: { fontSize: 20, fontWeight: '800', color: '#79573f', flex: 1 },
    editProfileBtn: {
        backgroundColor: '#efe8d5', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16,
    },
    editProfileBtnText: { fontSize: 12, fontWeight: 'bold', color: '#79573f' },
    bio: { fontSize: 12, color: '#41474e', lineHeight: 17, marginBottom: 10 },
    statsRow: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#e9e2d0', paddingTop: 10 },
    statItem: {},
    statVal: { fontSize: 17, fontWeight: '800', color: '#79573f' },
    statLbl: { fontSize: 9, color: '#72787f', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 'bold' },
    ctaRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    followBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: '#30628a', paddingVertical: 12, borderRadius: 12,
    },
    followBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    messageBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: '#e9e2d0', paddingVertical: 12, borderRadius: 12,
    },
    messageBtnText: { color: '#30628a', fontWeight: 'bold', fontSize: 14 },
    shareBtn: {
        width: 46, height: 46, alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#e9e2d0', borderRadius: 12,
    },
    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#efe8d5',
        marginBottom: 10,
    },
    tabItem: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 12,
        borderBottomWidth: 2.5, borderBottomColor: 'transparent',
    },
    tabItemActive: { borderBottomColor: '#f59e0b' },
    tabLbl: { fontSize: 9, fontWeight: 'bold', color: '#72787f', letterSpacing: 1, textTransform: 'uppercase' },
    tabLblActive: { color: '#79573f' },
    postGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    postCell: { width: '31.8%', aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    postCellImg: { width: '100%', height: '100%' },
    emptyGrid: { alignItems: 'center', paddingVertical: 40, gap: 10 },
    emptyGridText: { fontSize: 14, color: '#72787f', fontStyle: 'italic' },
    logoutRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: 24, paddingVertical: 14, borderRadius: 12,
        borderWidth: 2, borderColor: '#ba1a1a',
    },
    logoutText: { color: '#ba1a1a', fontWeight: 'bold', fontSize: 15 },
});
