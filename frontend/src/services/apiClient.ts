import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { ApiResponse, AuthResponseData } from '@housing-clone/shared';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Enables sending HttpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach in-memory access token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Silent refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<ApiResponse<AuthResponseData>>(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        const data = refreshResponse.data.data;
        if (data && data.accessToken) {
          useAuthStore.getState().setAuth(data.user, data.accessToken);
          processQueue(null, data.accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          useAuthStore.getState().clearAuth();
          processQueue(error, null);
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        useAuthStore.getState().clearAuth();
        processQueue(refreshErr as AxiosError, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
