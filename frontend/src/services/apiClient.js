import axios from 'axios'
import { API_BASE_URL } from '../config/api'

// Add this helper to handle BigInt
const serializeBigInt = (data) => {
  return JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // This tells Axios to use our custom serializer instead of default JSON.stringify
  transformRequest: [function (data, headers) {
    return serializeBigInt(data);
  }]
})

// Keep your existing interceptor for the Auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default apiClient