import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const ip = debuggerHost ? debuggerHost.split(':')[0] : '192.168.73.16';
export const API_URL = `http://${ip}:5000/api/users`;

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(
    async (config) => {
        const stored = await AsyncStorage.getItem('userData');
        if (stored) {
            const userData = JSON.parse(stored);
            if (userData._id) {
                config.headers['x-user-id'] = userData._id;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Feedbacks API
export const feedbackApi = axios.create({ baseURL: `${BASE_URL}/feedbacks` });
feedbackApi.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

export default api;
