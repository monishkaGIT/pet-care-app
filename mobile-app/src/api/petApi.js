import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const ip = debuggerHost ? debuggerHost.split(':')[0] : '192.168.73.16';
const BASE_URL = `http://${ip}:5000/api/pets`;

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
    const res = await axios.get(BASE_URL, { headers });
    return res.data;
};

export const fetchPetById = async (petId) => {
    const headers = await getHeaders();
    const res = await axios.get(`${BASE_URL}/${petId}`, { headers });
    return res.data;
};

export const createPet = async (petData) => {
    const headers = await getHeaders();
    const res = await axios.post(BASE_URL, petData, { headers });
    return res.data;
};

export const updatePet = async (petId, petData) => {
    const headers = await getHeaders();
    const res = await axios.put(`${BASE_URL}/${petId}`, petData, { headers });
    return res.data;
};

export const deletePet = async (petId) => {
    const headers = await getHeaders();
    const res = await axios.delete(`${BASE_URL}/${petId}`, { headers });
    return res.data;
};

export const askPawly = async (message) => {
    const headers = await getHeaders();
    const res = await axios.post(`http://${ip}:5000/api/ask-pawly`, { message }, { headers });
    return res.data;
};

