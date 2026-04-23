import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './baseUrl';

const PETS_URL = `${BASE_URL}/pets`;

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

export const fetchUserPets = async () => {
    const headers = await getHeaders();
    const res = await axios.get(PETS_URL, { headers });
    return res.data;
};

export const fetchPetById = async (petId) => {
    const headers = await getHeaders();
    const res = await axios.get(`${PETS_URL}/${petId}`, { headers });
    return res.data;
};

export const createPet = async (petData) => {
    const headers = await getHeaders();
    const res = await axios.post(PETS_URL, petData, { headers });
    return res.data;
};

export const updatePet = async (petId, petData) => {
    const headers = await getHeaders();
    const res = await axios.put(`${PETS_URL}/${petId}`, petData, { headers });
    return res.data;
};

export const deletePet = async (petId) => {
    const headers = await getHeaders();
    const res = await axios.delete(`${PETS_URL}/${petId}`, { headers });
    return res.data;
};

export const askPawly = async (message) => {
    const headers = await getHeaders();
    const res = await axios.post(`${BASE_URL}/ask-pawly`, { message }, { headers });
    return res.data;
};

