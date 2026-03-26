import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import HomeScreen from '../screens/main/HomeScreen';
import ServicesScreen from '../screens/main/ServicesScreen';
import SocialScreen from '../screens/main/SocialScreen';
import PetHealthScreen from '../screens/main/PetHealthScreen';
import FeedbackScreen from '../screens/user/FeedbackScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'MyPets') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Services') iconName = focused ? 'paw' : 'paw-outline';
                    else if (route.name === 'Social') iconName = focused ? 'people' : 'people-outline';
                    else if (route.name === 'PetHealth') iconName = focused ? 'medkit' : 'medkit-outline';
                    else if (route.name === 'Feedback') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.secondary,
                tabBarInactiveTintColor: COLORS.primary,
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    borderTopWidth: 0,
                    elevation: 10,
                    height: 95,
                    paddingBottom: 40,
                    paddingTop: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: 'bold',
                }
            })}
        >
            <Tab.Screen name="MyPets" component={HomeScreen} />
            <Tab.Screen name="Services" component={ServicesScreen} />
            <Tab.Screen name="Social" component={SocialScreen} />
            <Tab.Screen
                name="PetHealth"
                component={PetHealthScreen}
                options={{
                    headerShown: true,
                    title: 'Pet Health',
                    headerStyle: { backgroundColor: COLORS.primary },
                    headerTintColor: COLORS.secondary,
                    headerTitleAlign: 'center',
                    tabBarLabel: 'Pet Health',
                }}
            />
            <Tab.Screen
                name="Feedback"
                component={FeedbackScreen}
                options={{
                    headerShown: true,
                    title: 'Feedback',
                    headerStyle: { backgroundColor: COLORS.primary },
                    headerTintColor: COLORS.secondary,
                    headerTitleAlign: 'center',
                }}
            />
        </Tab.Navigator>
    );
}
