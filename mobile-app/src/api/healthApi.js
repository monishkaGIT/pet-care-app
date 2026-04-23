import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './baseUrl';

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

const healthUrl = (petId) => `${BASE_URL}/pets/${petId}/health`;

// ─── Health Summary ─────────────────────────────────
export const fetchHealthSummary = async (petId) => {
    const headers = await getHeaders();
    const res = await axios.get(`${healthUrl(petId)}/summary`, { headers });
    return res.data;
};

// ─── Health Records ─────────────────────────────────
export const fetchHealthRecords = async (petId) => {
    const headers = await getHeaders();
    const res = await axios.get(`${healthUrl(petId)}/records`, { headers });
    return res.data;
};

export const fetchHealthRecordById = async (petId, recordId) => {
    const headers = await getHeaders();
    const res = await axios.get(`${healthUrl(petId)}/records/${recordId}`, { headers });
    return res.data;
};

export const createHealthRecord = async (petId, data) => {
    const headers = await getHeaders();
    const res = await axios.post(`${healthUrl(petId)}/records`, data, { headers });
    return res.data;
};

export const updateHealthRecord = async (petId, recordId, data) => {
    const headers = await getHeaders();
    const res = await axios.put(`${healthUrl(petId)}/records/${recordId}`, data, { headers });
    return res.data;
};

export const deleteHealthRecord = async (petId, recordId) => {
    const headers = await getHeaders();
    const res = await axios.delete(`${healthUrl(petId)}/records/${recordId}`, { headers });
    return res.data;
};

// ─── Vaccinations ───────────────────────────────────
export const fetchVaccinations = async (petId) => {
    const headers = await getHeaders();
    const res = await axios.get(`${healthUrl(petId)}/vaccinations`, { headers });
    return res.data;
};

export const createVaccination = async (petId, data) => {
    const headers = await getHeaders();
    const res = await axios.post(`${healthUrl(petId)}/vaccinations`, data, { headers });
    return res.data;
};

export const updateVaccination = async (petId, vacId, data) => {
    const headers = await getHeaders();
    const res = await axios.put(`${healthUrl(petId)}/vaccinations/${vacId}`, data, { headers });
    return res.data;
};

export const deleteVaccination = async (petId, vacId) => {
    const headers = await getHeaders();
    const res = await axios.delete(`${healthUrl(petId)}/vaccinations/${vacId}`, { headers });
    return res.data;
};

// ─── Weight Logs ────────────────────────────────────
export const fetchWeightHistory = async (petId) => {
    const headers = await getHeaders();
    const res = await axios.get(`${healthUrl(petId)}/weight`, { headers });
    return res.data;
};

export const addWeightEntry = async (petId, data) => {
    const headers = await getHeaders();
    const res = await axios.post(`${healthUrl(petId)}/weight`, data, { headers });
    return res.data;
};

export const deleteWeightEntry = async (petId, logId) => {
    const headers = await getHeaders();
    const res = await axios.delete(`${healthUrl(petId)}/weight/${logId}`, { headers });
    return res.data;
};
