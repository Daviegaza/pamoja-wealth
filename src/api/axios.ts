import axios from "axios";

/**
 * Pre-configured Axios instance. The frontend currently runs entirely on the
 * mock data layer (see src/mock), so no requests are made over the network yet.
 * Swap VITE_API_BASE_URL and wire up the services in src/services to connect
 * a real backend.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://api.pamojawealth.app/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pamoja_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
