import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './axiosConfig';

const SERVICE_API_URL = `${BASE_URL}/api/services`;

const serviceApi = axios.create({
    baseURL: SERVICE_API_URL,
});

// Attach JWT token to every request
serviceApi.interceptors.request.use(
    async (config) => {
        const stored = await AsyncStorage.getItem('userData');
        if (stored) {
            const userData = JSON.parse(stored);
            if (userData.token) {
                config.headers['Authorization'] = `Bearer ${userData.token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Service API Functions ──────────────────────────────────────────

export const fetchServices = async () => {
    const { data } = await serviceApi.get('/');
    return data;
};

export const fetchServiceById = async (id) => {
    const { data } = await serviceApi.get(`/${id}`);
    return data;
};

/**
 * Create a new service — sends FormData (multipart/form-data) for Multer
 * @param {Object} serviceData - { name, category, description, price, isActive, icon, image (file object) }
 */
export const createService = async (serviceData) => {
    const formData = new FormData();

    formData.append('name', serviceData.name);
    formData.append('category', serviceData.category);
    formData.append('description', serviceData.description);
    formData.append('price', serviceData.price.toString());
    formData.append('isActive', serviceData.isActive.toString());
    if (serviceData.icon) formData.append('icon', serviceData.icon);

    if (serviceData.image) {
        formData.append('image', {
            uri: serviceData.image.uri,
            type: serviceData.image.type || 'image/jpeg',
            name: serviceData.image.name || 'service_image.jpg',
        });
    }

    const { data } = await serviceApi.post('/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

/**
 * Update a service — sends FormData (multipart/form-data)
 * Image is optional for updates
 */
export const updateService = async (id, serviceData) => {
    const formData = new FormData();

    if (serviceData.name !== undefined) formData.append('name', serviceData.name);
    if (serviceData.category !== undefined) formData.append('category', serviceData.category);
    if (serviceData.description !== undefined) formData.append('description', serviceData.description);
    if (serviceData.price !== undefined) formData.append('price', serviceData.price.toString());
    if (serviceData.isActive !== undefined) formData.append('isActive', serviceData.isActive.toString());
    if (serviceData.icon !== undefined) formData.append('icon', serviceData.icon);

    if (serviceData.image) {
        formData.append('image', {
            uri: serviceData.image.uri,
            type: serviceData.image.type || 'image/jpeg',
            name: serviceData.image.name || 'service_image.jpg',
        });
    }

    const { data } = await serviceApi.put(`/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const deleteService = async (id) => {
    const { data } = await serviceApi.delete(`/${id}`);
    return data;
};

export const fetchServiceStats = async () => {
    const { data } = await serviceApi.get('/stats');
    return data;
};

export default serviceApi;
