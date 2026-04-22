import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Social screens
import SocialFeedScreen from '../screens/social/SocialScreen';
import ExploreScreen from '../screens/social/ExploreScreen';
import CreatePostScreen from '../screens/social/CreatePostScreen';
import AlertsScreen from '../screens/main/NotificationsScreen';
import SocialProfileScreen from '../screens/social/SocialProfileScreen';

const Tab = createBottomTabNavigator();

// Custom bottom tab bar component matching pet-stagram nav design
function SocialTabBar({ state, descriptors, navigation }) {
    const TABS = [
        { name: 'Feed', icon: 'home', activeIcon: 'home', label: 'Feed' },
        { name: 'Explore', icon: 'explore', activeIcon: 'explore', label: 'Explore' },
        { name: 'Create', icon: 'add-circle-outline', activeIcon: 'add-circle', label: 'Create' },
        { name: 'Alerts', icon: 'notifications-none', activeIcon: 'notifications', label: 'Alerts' },
        { name: 'Profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
    ];

    return (
        <View style={styles.tabBarWrapper}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const tab = TABS[index];
                    const isFocused = state.index === index;
                    const isCreate = route.name === 'Create';

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    if (isCreate) {
                        return (
                            <TouchableOpacity
                                key={route.key}
                                style={styles.createTab}
                                onPress={onPress}
                                activeOpacity={0.85}
                            >
                                <View style={[styles.createBtn, isFocused && styles.createBtnActive]}>
                                    <MaterialIcons
                                        name={isFocused ? 'close' : 'add'}
                                        size={30}
                                        color="#ffffff"
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            style={styles.tabItem}
                            onPress={onPress}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapActive]}>
                                <MaterialIcons
                                    name={isFocused ? tab.activeIcon : tab.icon}
                                    size={24}
                                    color={isFocused ? '#79573f' : '#a2d2ff'}
                                />
                            </View>
                            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default function SocialTabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Feed"
            backBehavior="initialRoute"
            tabBar={(props) => <SocialTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Feed" component={SocialFeedScreen} />
            <Tab.Screen name="Explore" component={ExploreScreen} />
            <Tab.Screen name="Create" component={CreatePostScreen} />
            <Tab.Screen name="Alerts" component={AlertsScreen} />
            <Tab.Screen name="Profile" component={SocialProfileScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        // Extra bottom padding for home indicator on iPhones
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        backgroundColor: 'transparent',
    },
    tabBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#fff9ec',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 10,
        shadowColor: 'rgba(111,78,55,0.12)',
        shadowOffset: { width: 0, height: -10 },
        shadowRadius: 24,
        shadowOpacity: 1,
        elevation: 16,
        // Top border accent
        borderTopWidth: 1,
        borderTopColor: '#efe8d5',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 4,
    },
    tabIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIconWrapActive: {
        backgroundColor: 'rgba(250,243,224,0.9)',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#a2d2ff',
        marginTop: 2,
        letterSpacing: 0.3,
    },
    tabLabelActive: {
        color: '#79573f',
        fontWeight: 'bold',
    },
    // Create/Post tab — amber pill that floats up
    createTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 4,
    },
    createBtn: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#f59e0b',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8, // floats above the bar
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
        // amber glow outline
        borderWidth: 3,
        borderColor: 'rgba(245,158,11,0.25)',
    },
    createBtnActive: {
        backgroundColor: '#d97706',
    },
});
