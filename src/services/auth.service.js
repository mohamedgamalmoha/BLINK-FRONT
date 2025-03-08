const API_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN_KEY = 'token';

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({
            message: 'An unexpected error occurred'
        }));
        throw new Error(errorData.message || `${response.status}: ${response.statusText}`);
    }
    return response.json();
};

// Helper to get auth headers from stored credentials
const getAuthHeaders = () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return token ? {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + token
    } : {
        'Content-Type': 'application/json'
    };
};

async function register(userData) {
    const response = await fetch(`${API_URL}/users/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData),
    });

    return handleResponse(response);
}

async function login(username, password) {
    const base64Credentials = btoa(username + ':' + password);

    const response = await fetch(`${API_URL}/users/me/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + base64Credentials
        }
    });

    const data = await handleResponse(response);

    // Store credentials in localStorage upon successful login
    localStorage.setItem(AUTH_TOKEN_KEY, base64Credentials);

    return data;
}

async function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

function isAuthenticated() {
    return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
}

// Method to get user data using stored credentials
async function getCurrentUser() {
    if (!isAuthenticated()) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/users/me/`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    return handleResponse(response);
}

// Use this for authenticated API requests
async function fetchAuthenticated(endpoint, options = {}) {
    const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_URL}/${endpoint}`, {
        ...options,
        headers
    });

    return handleResponse(response);
}


export default { register, login, logout, isAuthenticated, getCurrentUser, fetchAuthenticated };
