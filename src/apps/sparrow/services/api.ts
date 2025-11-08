import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SPARROW_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sparrow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// PDF API
export const pdfAPI = {
  upload: (formData: FormData) =>
    api.post('/pdfs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/pdfs'),
  getById: (id: string) => api.get(`/pdfs/${id}`),
  download: (id: string) => api.get(`/pdfs/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/pdfs/${id}`),
};

// Comment API
export const commentAPI = {
  create: (data: {
    pdf_id: number;
    content: string;
    page_number: number;
    x_position: number;
    y_position: number;
  }) => api.post('/comments', data),
  getByPdf: (pdfId: string) => api.get(`/comments/pdf/${pdfId}`),
  update: (id: number, data: { content?: string; x_position?: number; y_position?: number }) => api.put(`/comments/${id}`, data),
  delete: (id: number) => api.delete(`/comments/${id}`),
  toggleResolved: (id: number) => api.patch(`/comments/${id}/resolve`),
};

export default api;
