import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const checkLoginStatus = async () => {
        const startTime = Date.now();
        try {
            const storedUser = await AsyncStorage.getItem('userData');
            if (storedUser) {
                try {
                    const response = await api.get('/profile');
                    setUser(response.data);
                    await AsyncStorage.setItem('userData', JSON.stringify(response.data));
                } catch (profileError) {
                    await AsyncStorage.removeItem('userData');
                    setUser(null);
                }
            }
        } catch (e) {
            console.error('Failed to load user', e);
            await AsyncStorage.removeItem('userData');
            setUser(null);
        } finally {
            const elapsedTime = Date.now() - startTime;
            const delay = Math.max(0, 6000 - elapsedTime);
            setTimeout(() => {
                setIsLoading(false);
            }, delay);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        const userData = response.data;
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const register = async (formData) => {
        const response = await api.post('/register', formData);
        return response.data;
    };

    const verifyOtp = async (email, otp) => {
        const response = await api.post('/verify-otp', { email, otp });
        const userData = response.data;
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const requestPasswordReset = async (email) => {
        const response = await api.post('/forgot-password', { email });
        return response.data;
    };

    const resetPassword = async (email, otp, newPassword) => {
        const response = await api.post('/reset-password', { email, otp, newPassword });
        return response.data;
    };

    const logout = async () => {
        await AsyncStorage.removeItem('userData');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, isLoading, login, register, verifyOtp, requestPasswordReset, resetPassword, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
