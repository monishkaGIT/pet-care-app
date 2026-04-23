import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const ip = debuggerHost ? debuggerHost.split(':')[0] : '192.168.73.16';
const BASE_URL = `http://${ip}:5000/api/bookings`;

const getHeaders = async () => {
    const stored = await AsyncStorage.getItem('userData');
    const headers = {};
    if (stored) {
        const userData = JSON.parse(stored);
        if (userData._id) {
            headers['x-user-id'] = userData._id;
        }
    }
    return headers;
};

export const createBooking = async (bookingData) => {
    const headers = await getHeaders();
    const res = await axios.post(BASE_URL, bookingData, { headers });
    return res.data;
};

export const fetchBookings = async () => {
    const headers = await getHeaders();
    const res = await axios.get(BASE_URL, { headers });
    return res.data;
};

export const updateBooking = async (bookingId, bookingData) => {
    const headers = await getHeaders();
    const res = await axios.put(`${BASE_URL}/${bookingId}`, bookingData, { headers });
    return res.data;
};

export const deleteBooking = async (bookingId) => {
    const headers = await getHeaders();
    const res = await axios.delete(`${BASE_URL}/${bookingId}`, { headers });
    return res.data;
};
