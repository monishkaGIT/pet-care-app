import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './baseUrl';

const BOOKING_URL = `${BASE_URL}/bookings`;

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
    const res = await axios.post(BOOKING_URL, bookingData, { headers });
    return res.data;
};

export const fetchBookings = async () => {
    const headers = await getHeaders();
    const res = await axios.get(BOOKING_URL, { headers });
    return res.data;
};

export const updateBooking = async (bookingId, bookingData) => {
    const headers = await getHeaders();
    const res = await axios.put(`${BOOKING_URL}/${bookingId}`, bookingData, { headers });
    return res.data;
};

export const deleteBooking = async (bookingId) => {
    const headers = await getHeaders();
    const res = await axios.delete(`${BOOKING_URL}/${bookingId}`, { headers });
    return res.data;
};

// ── Admin APIs ──

export const fetchAllBookings = async () => {
    const headers = await getHeaders();
    const res = await axios.get(`${BOOKING_URL}/admin/all`, { headers });
    return res.data;
};

export const updateBookingStatus = async (bookingId, status) => {
    const headers = await getHeaders();
    const res = await axios.put(`${BOOKING_URL}/admin/${bookingId}/status`, { status }, { headers });
    return res.data;
};
