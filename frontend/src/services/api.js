import axios from "axios";
import { getAccessToken, getRefreshToken, setSession, clearSession } from "./tokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise = null;

function requestNewAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return Promise.reject(new Error("No refresh token available"));
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        setSession(data);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (response?.status !== 401 || config._retried) {
      return Promise.reject(error);
    }

    config._retried = true;

    try {
      const accessToken = await requestNewAccessToken();
      config.headers.Authorization = `Bearer ${accessToken}`;
      return api(config);
    } catch {
      clearSession();
      return Promise.reject(error);
    }
  }
);

export default api;
