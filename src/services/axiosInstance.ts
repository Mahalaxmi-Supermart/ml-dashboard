import axios from 'axios'
import { config } from '../config'
import { AUTH_TOKEN_STORAGE_KEY } from '../constants/authStorage'

const axiosInstance = axios.create({
  baseURL: config.authApiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use((reqConfig) => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore storage access errors
  }
  return reqConfig
})

export default axiosInstance
