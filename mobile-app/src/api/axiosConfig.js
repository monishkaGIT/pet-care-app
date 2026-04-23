import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './baseUrl';

export const API_URL = `${BASE_URL}/users`;

// Shared request interceptor that injects x-user-id
const authInterceptor = async (config) => {
    const stored = await AsyncStorage.getItem('userData');
    if (stored) {
        const userData = JSON.parse(stored);
        if (userData._id) {
            config.headers['x-user-id'] = userData._id;
        }
    }
    return config;
};

// Users API
const api = axios.create({ baseURL: API_URL });
api.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

// Pets API
export const petApi = axios.create({ baseURL: `${BASE_URL}/pets` });
petApi.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

// Posts API (Social Feed)
export const postApi = axios.create({ baseURL: `${BASE_URL}/posts` });
postApi.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

// Feedbacks API
export const feedbackApi = axios.create({ baseURL: `${BASE_URL}/feedbacks` });
feedbackApi.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

// Health API (base for pet health — petId is appended at call-site)
export const healthApi = axios.create({ baseURL: `${BASE_URL}/pets` });
healthApi.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

export default api;
