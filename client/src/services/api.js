import axios from 'axios';

// In development or when VITE_API_URL is configured, use that; otherwise fallback to backend port 5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000 // Extended timeout for AI generation
});

export const getCases = () => api.get('/cases');
export const getCaseById = (id) => api.get(`/cases/${id}`);
export const createCase = (data) => api.post('/cases', data);
export const discoverClue = (caseId, clueId) => api.post(`/cases/${caseId}/clues/${clueId}/discover`);
export const requestHint = (caseId) => api.post(`/cases/${caseId}/hints`);
export const submitAccusation = (caseId, data) => api.post(`/cases/${caseId}/accuse`, data);
export const getCaseResult = (caseId) => api.get(`/cases/${caseId}/result`);

export default api;
