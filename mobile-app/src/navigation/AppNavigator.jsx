import React, { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LandingScreen from '../screens/auth/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Tab Navigator
import MainTabNavigator from './MainTabNavigator';

// User Screens
import ProfileScreen from '../screens/user/ProfileScreen';
import ChangePasswordScreen from '../screens/user/ChangePasswordScreen';

// Pet Management Flow
import MyPetsListScreen from '../screens/main/MyPetsListScreen';
import AddPetSelectTypeScreen from '../screens/main/AddPetSelectTypeScreen';
import AddPetDetailsScreen from '../screens/main/AddPetDetailsScreen';
import EditPetProfileScreen from '../screens/main/EditPetProfileScreen';
import PetDetailScreen from '../screens/main/PetDetailScreen';

// Social Screens
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ExploreScreen from '../screens/social/ExploreScreen';
import CreatePostScreen from '../screens/social/CreatePostScreen';
import EditPostScreen from '../screens/social/EditPostScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserListScreen from '../screens/admin/UserListScreen';
import CreateUserScreen from '../screens/admin/CreateUserScreen';
import EditUserScreen from '../screens/admin/EditUserScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user === null ? (
                    <>
                        <Stack.Screen name="Splash" component={SplashScreen} />
                        <Stack.Screen name="Landing" component={LandingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : user.role === 'admin' ? (
                    <>
                        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: true, title: 'Admin Home', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.secondary }} />
                        <Stack.Screen name="UserList" component={UserListScreen} options={{ headerShown: true, title: 'Manage Users', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.secondary }} />
                        <Stack.Screen name="CreateUser" component={CreateUserScreen} options={{ headerShown: true, title: 'Create User', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.secondary }} />
                        <Stack.Screen name="EditUser" component={EditUserScreen} options={{ headerShown: true, title: 'Edit User', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.secondary }} />
                    </>
                ) : (
                    <>
                        {/* Main App — Bottom Tabs */}
                        <Stack.Screen name="MainTabs" component={MainTabNavigator} />

                        {/* User Profile */}
                        <Stack.Screen name="UserProfile" component={ProfileScreen} />
                        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: 'Change Password', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.secondary }} />

                        {/* Pet CRUD Flow */}
                        <Stack.Screen name="MyPetsList" component={MyPetsListScreen} />
                        <Stack.Screen name="AddPetSelectType" component={AddPetSelectTypeScreen} />
                        <Stack.Screen name="AddPetDetails" component={AddPetDetailsScreen} />
                        <Stack.Screen name="EditPetProfile" component={EditPetProfileScreen} />
                        <Stack.Screen name="PetDetail" component={PetDetailScreen} />

                        {/* Social Feed Screens */}
                        <Stack.Screen name="Notifications" component={NotificationsScreen} />
                        <Stack.Screen name="Explore" component={ExploreScreen} />
                        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
                        <Stack.Screen name="EditPost" component={EditPostScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
