import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk menyisipkan token JWT ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexa_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor response untuk menangani error global (seperti token expired)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Jika unauthorized / token kedaluwarsa, hapus storage
      localStorage.removeItem('nexa_token');
      localStorage.removeItem('nexa_user');
    }
    return Promise.reject(
      error.response ? error.response.data : { success: false, message: 'Koneksi server terputus.' }
    );
  }
);

export default api;
