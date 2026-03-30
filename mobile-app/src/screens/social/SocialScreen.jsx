import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SocialScreen({ navigation }) {
    const handleHomePress = () => {
        Alert.alert(
            "Quit Social",
            "Are you sure you want to quit the social and go back to main home?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: () => navigation.navigate('MyPets') }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Top App Bar */}
            <View style={styles.headerWrapper}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8} onPress={handleHomePress}>
                        <MaterialIcons name="home" size={24} color="#30628a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Social Feed</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
                        <MaterialIcons name="add-circle" size={24} color="#30628a" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Stories Row */}
                <View style={styles.storiesSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
                        
                        {/* Add Story */}
                        <View style={styles.storyContainer}>
                            <View style={[styles.storyRing, styles.storyRingYour]}>
                                <View style={styles.storyIconWrapper}>
                                    <View style={[styles.storyIconInner, styles.storyYourBg]}>
                                        <MaterialIcons name="person-add" size={28} color="#30628a" />
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.storyTextYour}>YOUR STORY</Text>
                        </View>

                        {/* Pet Story 1 */}
                        <View style={styles.storyContainer}>
                            <View style={[styles.storyRing, styles.storyRingPet]}>
                                <View style={styles.storyIconWrapper}>
                                    <View style={[styles.storyIconInner, styles.storyPetBg]}>
                                        <MaterialIcons name="pets" size={28} color="#79573f" />
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.storyTextPet}>COOPER</Text>
                        </View>

                        {/* Pet Story 2 */}
                        <View style={styles.storyContainer}>
                            <View style={[styles.storyRing, styles.storyRingPet]}>
                                <View style={styles.storyIconWrapper}>
                                    <View style={[styles.storyIconInner, styles.storyPetBg]}>
                                        <MaterialIcons name="directions-run" size={28} color="#79573f" />
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.storyTextPet}>LUNA</Text>
                        </View>

                        {/* Pet Story 3 */}
                        <View style={styles.storyContainer}>
                            <View style={[styles.storyRing, styles.storyRingPet]}>
                                <View style={styles.storyIconWrapper}>
                                    <View style={[styles.storyIconInner, styles.storyPetBg]}>
                                        <MaterialIcons name="cruelty-free" size={28} color="#79573f" />
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.storyTextPet}>BINKY</Text>
                        </View>

                    </ScrollView>
                </View>

                {/* Main Feed Posts */}
                <View style={styles.feedContainer}>
                    
                    {/* Post Card 1 */}
                    <View style={styles.postCard}>
                        {/* Post Header */}
                        <View style={styles.postHeader}>
                            <View style={styles.postHeaderLeft}>
                                <View style={styles.postAvatar}>
                                    <MaterialIcons name="pets" size={20} color="#30628a" />
                                </View>
                                <View>
                                    <Text style={styles.postUsername}>Cooper the Golden</Text>
                                    <Text style={styles.postLocation}>Central Park, NY</Text>
                                </View>
                            </View>
                            <TouchableOpacity>
                                <MaterialIcons name="more-horiz" size={24} color="#72787f" />
                            </TouchableOpacity>
                        </View>

                        {/* Post Image Placeholder */}
                        <View style={styles.postImageContainer}>
                            <MaterialIcons name="park" size={100} color="rgba(162, 210, 255, 0.4)" />
                            
                            {/* Decorative Badge */}
                            <View style={styles.postBadge}>
                                <MaterialIcons name="wb-sunny" size={16} color="#f59e0b" />
                                <Text style={styles.postBadgeText}>SUNNY DAY VIBEZ</Text>
                            </View>
                        </View>

                        {/* Action Bar */}
                        <View style={styles.actionBar}>
                            <View style={styles.actionLeft}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <MaterialIcons name="favorite-outline" size={26} color="#79573f" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <MaterialIcons name="chat-bubble-outline" size={24} color="#79573f" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <MaterialIcons name="send" size={24} color="#79573f" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity>
                                <MaterialIcons name="bookmark-outline" size={26} color="#79573f" />
                            </TouchableOpacity>
                        </View>

                        {/* Post Caption */}
                        <View style={styles.captionContainer}>
                            <Text style={styles.captionText}>
                                <Text style={styles.captionUsername}>cooper_golden </Text>
                                Found the perfect stick today! It only took 45 minutes of searching through the grass. 🐶✨
                            </Text>
                            <TouchableOpacity>
                                <Text style={styles.viewCommentsText}>View all 12 comments</Text>
                            </TouchableOpacity>
                            <Text style={styles.timestampText}>2 HOURS AGO</Text>
                        </View>
                    </View>

                    {/* Post Card 2 */}
                    <View style={styles.postCard}>
                        {/* Post Header */}
                        <View style={styles.postHeader}>
                            <View style={styles.postHeaderLeft}>
                                <View style={[styles.postAvatar, {backgroundColor: 'rgba(255, 192, 146, 0.3)'}]}>
                                    <MaterialIcons name="pets" size={20} color="#8e4e14" />
                                </View>
                                <View>
                                    <Text style={styles.postUsername}>Mochi Bean</Text>
                                    <Text style={styles.postLocation}>The Sunny Window Sill</Text>
                                </View>
                            </View>
                            <TouchableOpacity>
                                <MaterialIcons name="more-horiz" size={24} color="#72787f" />
                            </TouchableOpacity>
                        </View>

                        {/* Post Image Placeholder */}
                        <View style={styles.postImageContainer}>
                            <View style={styles.placeholderBox2}>
                                <MaterialIcons name="bedtime" size={100} color="rgba(142, 78, 20, 0.3)" />
                            </View>
                            
                            {/* Decorative Badge */}
                            <View style={[styles.postBadge, styles.postBadgeOrange]}>
                                <Text style={styles.postBadgeTextOrange}>CHILL MODE</Text>
                            </View>
                        </View>

                        {/* Action Bar */}
                        <View style={styles.actionBar}>
                            <View style={styles.actionLeft}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <MaterialIcons name="favorite" size={26} color="#f59e0b" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <MaterialIcons name="chat-bubble-outline" size={24} color="#79573f" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <MaterialIcons name="send" size={24} color="#79573f" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity>
                                <MaterialIcons name="bookmark-outline" size={26} color="#79573f" />
                            </TouchableOpacity>
                        </View>

                        {/* Post Caption */}
                        <View style={styles.captionContainer}>
                            <Text style={styles.captionText}>
                                <Text style={styles.captionUsername}>mochi_bean </Text>
                                Nap #4 of the day. It's a hard life being this cute, but someone has to do it. 🐾💤
                            </Text>
                            <TouchableOpacity>
                                <Text style={styles.viewCommentsText}>View all 48 comments</Text>
                            </TouchableOpacity>
                            <Text style={styles.timestampText}>5 HOURS AGO</Text>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff9ec' },
    headerWrapper: {
        backgroundColor: '#a2d2ff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
        shadowColor: '#6f4e37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerBtn: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#30628a',
        fontStyle: 'italic',
        marginLeft: 10,
    },
    headerRight: {},
    scrollContent: {
        paddingBottom: 100, // accommodate bottom nav
    },
    storiesSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    storiesScroll: {
        paddingHorizontal: 20,
    },
    storyContainer: {
        alignItems: 'center',
        marginRight: 20,
    },
    storyRing: {
        padding: 4,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    storyRingYour: { backgroundColor: '#fcd34d' }, // amber-300
    storyRingPet: { backgroundColor: '#f59e0b' }, // amber-500
    storyIconWrapper: {
        backgroundColor: '#fff9ec', // surface
        borderRadius: 36,
        padding: 3,
    },
    storyIconInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff9ec',
    },
    storyYourBg: { backgroundColor: '#ffffff' },
    storyPetBg: { backgroundColor: '#faf3e0' },
    storyTextYour: { fontSize: 10, fontWeight: 'bold', color: '#79573f', letterSpacing: 0.5 },
    storyTextPet: { fontSize: 10, fontWeight: 'bold', color: '#41474e', letterSpacing: 0.5 },
    feedContainer: {
        paddingHorizontal: 16,
    },
    postCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: 'rgba(56, 56, 51, 0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    postHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    postAvatar: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(162, 210, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    postUsername: { fontSize: 14, fontWeight: 'bold', color: '#79573f' },
    postLocation: { fontSize: 11, color: '#41474e', marginTop: 2 },
    postImageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#faf3e0', // surface-container-low
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    placeholderBox2: {
        width: '80%', height: '80%',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 192, 146, 0.1)',
        borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center', justifyContent: 'center',
    },
    postBadge: {
        position: 'absolute',
        bottom: 20, left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: {width: 0, height: 2}, shadowRadius: 4, shadowOpacity: 1,
    },
    postBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#79573f', letterSpacing: 1, marginLeft: 6 },
    postBadgeOrange: {
        bottom: 'auto', left: 'auto', top: 20, right: 20,
        backgroundColor: '#f59e0b',
        transform: [{rotate: '12deg'}],
    },
    postBadgeTextOrange: { fontSize: 10, fontWeight: 'bold', color: '#ffffff', letterSpacing: 1 },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    actionLeft: { flexDirection: 'row', alignItems: 'center' },
    actionBtn: { marginRight: 16 },
    captionContainer: { paddingHorizontal: 16, paddingBottom: 20 },
    captionText: { fontSize: 14, color: '#1e1c10', lineHeight: 20 },
    captionUsername: { fontWeight: 'bold', color: '#79573f' },
    viewCommentsText: { fontSize: 12, color: '#41474e', fontWeight: '500', marginTop: 8 },
    timestampText: { fontSize: 10, color: '#72787f', letterSpacing: 0.5, marginTop: 4 }
});
