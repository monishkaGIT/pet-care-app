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

// User Main App
import MainTabNavigator from './MainTabNavigator';
import ProfileScreen from '../screens/user/ProfileScreen';
import ChangePasswordScreen from '../screens/user/ChangePasswordScreen';

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
                    // Unauthenticated Stack
                    <>
                        <Stack.Screen name="Splash" component={SplashScreen} />
                        <Stack.Screen name="Landing" component={LandingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : user.role === 'admin' ? (
                    // Admin Stack
                    <>
                        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: true, title: 'Admin Home', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.secondary }} />
                        <Stack.Screen name="UserList" component={UserListScreen} options={{ headerShown: true, title: 'Manage Users', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.secondary }} />
                        <Stack.Screen name="CreateUser" component={CreateUserScreen} options={{ headerShown: true, title: 'Create User', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.secondary }} />
                        <Stack.Screen name="EditUser" component={EditUserScreen} options={{ headerShown: true, title: 'Edit User', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.secondary }} />
                    </>
                ) : (
                    // Normal User Stack (Bottom Tabs act as Home base)
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'My Profile', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.secondary, headerTitleAlign: 'center' }} />
                        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: 'Change Password', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: COLORS.secondary }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
