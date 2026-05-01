import Constants from 'expo-constants';

const normalizeUrl = (url) => url.replace(/\/+$/, '');

const extractHostname = (value) => {
    if (!value) return null;

    try {
        const parsed = value.includes('://') ? new URL(value) : new URL(`http://${value}`);
        return parsed.hostname;
    } catch {
        const withoutScheme = value.replace(/^[a-zA-Z]+:\/\//, '');
        return withoutScheme.split('/')[0].split(':')[0] || null;
    }
};

const getExpoHost = () => {
    const hostUri =
        Constants.expoConfig?.hostUri ||
        Constants.manifest2?.extra?.expoClient?.hostUri ||
        Constants.manifest?.debuggerHost;

    return extractHostname(hostUri);
};

const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const BASE_URL = envUrl
    ? normalizeUrl(envUrl)
    : (() => {
        const host = getExpoHost();
        if (host && host !== 'localhost' && host !== '127.0.0.1') {
            return `http://${host}:5000/api`;
        }
        return 'http://192.168.1.10:5000/api';
    })();
