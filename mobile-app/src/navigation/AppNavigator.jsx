import React, { useContext } from 'react';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

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
import AskPawlyScreen from '../screens/main/AskPawlyScreen';
import BookAServiceScreen from '../screens/service-booking/BookAServiceScreen';
import MyBookingsScreen from '../screens/service-booking/MyBookingsScreen';
import AddPetScreen from '../screens/main/AddPetScreen';
import EditPetScreen from '../screens/main/EditPetScreen';
import MyPetsList from '../screens/main/MyPetsList';
import PetDetailScreen from '../screens/main/PetDetailScreen';
import NewHealthRecordScreen from '../screens/main/NewHealthRecordScreen';
import HealthRecordDetailScreen from '../screens/main/HealthRecordDetailScreen';

// Social Screens
import EditPostScreen from '../screens/social/EditPostScreen';
import MyPostsScreen from '../screens/social/MyPostsScreen';

// Public Screens (no auth)
import PublicFeedbackScreen from '../screens/feedback/PublicFeedbackScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import UserDetailsScreen from '../screens/admin/UserDetailsScreen';
import ManageServicesScreen from '../screens/admin/ManageServicesScreen';
import AddNewServiceScreen from '../screens/admin/AddNewServiceScreen';
import ServiceDetailsScreen from '../screens/admin/ServiceDetailsScreen';
import AdminBookingsScreen from '../screens/admin/AdminBookingsScreen';

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
                        <Stack.Screen name="PublicFeedback" component={PublicFeedbackScreen} />
                    </>
                ) : user.role === 'admin' ? (
                    <>
                        <Stack.Screen
                            name="AdminDashboard"
                            component={AdminDashboardScreen}
                            options={({ navigation }) => ({
                                headerShown: true,
                                title: 'Admin Home',
                                headerStyle: { backgroundColor: COLORS.primary },
                                headerTintColor: '#fff',
                                headerRight: () => (
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('AdminChangePassword')}
                                        style={{ marginRight: 16, padding: 6 }}
                                    >
                                        <MaterialIcons name="lock-outline" size={22} color="#fff" />
                                    </TouchableOpacity>
                                ),
                            })}
                        />
                        <Stack.Screen name="ManageUsers" component={ManageUsersScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="UserDetails" component={UserDetailsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ManageServices" component={ManageServicesScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="AddNewService" component={AddNewServiceScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="AdminChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: 'Change Password', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' }} />
                        <Stack.Screen name="AdminBookings" component={AdminBookingsScreen} options={{ headerShown: false }} />
                    </>
                ) : (
                    <>
                        {/* Main App — Bottom Tabs */}
                        <Stack.Screen name="MainTabs" component={MainTabNavigator} />

                        {/* User Profile */}
                        <Stack.Screen name="UserProfile" component={ProfileScreen} />
                        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: 'Change Password', headerStyle: { backgroundColor: COLORS.primary }, headerTintColor: '#fff' }} />

                        {/* Pet CRUD Flow */}
                        <Stack.Screen name="AddPet" component={AddPetScreen} />
                        <Stack.Screen name="MyPetsList" component={MyPetsList} />
                        <Stack.Screen name="PetDetail" component={PetDetailScreen} />
                        <Stack.Screen name="EditPet" component={EditPetScreen} />

                        {/* Health Record Screens */}
                        <Stack.Screen name="NewHealthRecord" component={NewHealthRecordScreen} />
                        <Stack.Screen name="HealthRecordDetail" component={HealthRecordDetailScreen} />

                        {/* Social detail screens */}
                        <Stack.Screen name="EditPost" component={EditPostScreen} />
                        <Stack.Screen name="MyPosts" component={MyPostsScreen} />
                        <Stack.Screen
                            name="AskPawly"
                            component={AskPawlyScreen}
                            options={{
                                headerShown: true,
                                title: 'Ask Pawly',
                                headerStyle: { backgroundColor: COLORS.primary },
                                headerTintColor: '#fff',
                                headerTitleAlign: 'center',
                            }}
                        />
                        <Stack.Screen name="BookAService" component={BookAServiceScreen} />
                        <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

