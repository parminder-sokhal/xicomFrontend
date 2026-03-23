import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const candidateService = {
  createCandidate: async (formData) => {
  try {
    const res = await api.post('/candidate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Something went wrong" };
  }
},

  getCandidate: async (id) => {
    const response = await api.get(`/candidate/${id}`);
    return response.data;
  },
};

export default api;
