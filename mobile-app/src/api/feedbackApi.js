import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './baseUrl';

const FEEDBACKS_URL = `${BASE_URL}/feedbacks`;

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

export const fetchUserFeedbacks = async () => {
    const headers = await getHeaders();
    const res = await axios.get(FEEDBACKS_URL, { headers });
    return res.data;
};

export const fetchFeedbackById = async (feedbackId) => {
    const headers = await getHeaders();
    const res = await axios.get(`${FEEDBACKS_URL}/${feedbackId}`, { headers });
    return res.data;
};

export const createFeedback = async (feedbackData) => {
    const headers = await getHeaders();
    const res = await axios.post(FEEDBACKS_URL, feedbackData, { headers });
    return res.data;
};

export const updateFeedback = async (feedbackId, feedbackData) => {
    const headers = await getHeaders();
    const res = await axios.put(`${FEEDBACKS_URL}/${feedbackId}`, feedbackData, { headers });
    return res.data;
};

export const deleteFeedback = async (feedbackId) => {
    const headers = await getHeaders();
    const res = await axios.delete(`${FEEDBACKS_URL}/${feedbackId}`, { headers });
    return res.data;
};
