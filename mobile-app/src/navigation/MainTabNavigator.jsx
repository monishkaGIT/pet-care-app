import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/main/HomeScreen';
import ServicesScreen from '../screens/main/ServicesScreen';
import SocialTabNavigator from './SocialTabNavigator';
import PetHealthScreen from '../screens/main/PetHealthScreen';
import FeedbackScreen from '../screens/user/FeedbackScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
    MyPets: { active: 'home', inactive: 'home' },
    Services: { active: 'pets', inactive: 'pets' },
    Social: { active: 'groups', inactive: 'groups' },
    PetHealth: { active: 'medical-services', inactive: 'medical-services' },
    Feedback: { active: 'chat', inactive: 'chat' },
};

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    const icons = TAB_ICONS[route.name];
                    return <MaterialIcons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#79573f',
                tabBarInactiveTintColor: '#a2d2ff',
                tabBarStyle: {
                    backgroundColor: '#fff9ec',
                    borderTopWidth: 0,
                    elevation: 10,
                    height: 88,
                    paddingBottom: 28,
                    paddingTop: 8,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    shadowColor: 'rgba(111,78,55,0.08)',
                    shadowOffset: { width: 0, height: -8 },
                    shadowRadius: 24,
                    shadowOpacity: 1,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: 'bold',
                    letterSpacing: 0.5,
                },
            })}
        >
            <Tab.Screen name="MyPets" component={HomeScreen} options={{ tabBarLabel: 'MyPets' }} />
            <Tab.Screen name="Services" component={ServicesScreen} options={{ tabBarLabel: 'Services' }} />
            {/* Social routes into its own nested tab flow (Feed/Explore/Create/Alerts/Profile) */}
            <Tab.Screen
                name="Social"
                component={SocialTabNavigator}
                options={{ tabBarLabel: 'Social', tabBarStyle: { display: 'none' } }}
            />
            <Tab.Screen name="PetHealth" component={PetHealthScreen} options={{ tabBarLabel: 'Health' }} />
            <Tab.Screen name="Feedback" component={FeedbackScreen} options={{ tabBarLabel: 'Feedback' }} />
        </Tab.Navigator>
    );
}
