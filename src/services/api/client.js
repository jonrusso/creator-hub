// API Client - toggleable between mock and real API
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // Default to mock

// Import mock services
import * as mockServices from '../mock';

// Real API base URL (to be implemented)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// API client wrapper
const createClient = () => {
    if (USE_MOCK) {
        console.log('🔧 Using MOCK data services');
        return mockServices;
    }

    console.log('🌐 Using REAL API:', API_BASE_URL);
    // Real API implementation would go here
    return {
        workflowsService: {
            getAll: () => fetch(`${API_BASE_URL}/workflows`).then(r => r.json()),
            getById: (id) => fetch(`${API_BASE_URL}/workflows/${id}`).then(r => r.json()),
            create: (data) => fetch(`${API_BASE_URL}/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then(r => r.json()),
            update: (id, data) => fetch(`${API_BASE_URL}/workflows/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then(r => r.json()),
            delete: (id) => fetch(`${API_BASE_URL}/workflows/${id}`, {
                method: 'DELETE'
            }).then(r => r.json())
        },
        boardsService: {
            getProduction: () => fetch(`${API_BASE_URL}/production`).then(r => r.json()),
            getInspiration: () => fetch(`${API_BASE_URL}/inspiration`).then(r => r.json()),
        },
        authService: {
            login: (email, password) => fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            }).then(r => r.json())
        }
    };
};

export const api = createClient();
export { USE_MOCK };
