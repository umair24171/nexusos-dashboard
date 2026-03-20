import axios, { AxiosError, AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_V1_URL = `${API_BASE_URL}/api/v1`;

let api: AxiosInstance | null = null;

function getApiInstance(): AxiosInstance {
  if (!api) {
    api = axios.create({
      baseURL: API_V1_URL,
      timeout: 10000,
    });

    api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
      (response) => {
        // Unwrap backend's { success, data, message } envelope
        if (
          response.data &&
          typeof response.data === "object" &&
          "success" in response.data
        ) {
          response.data = response.data.data;
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const response = await axios.post(`${API_V1_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data.data;
            localStorage.setItem("accessToken", accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api!(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  return api;
}

export const apiClient = {
  get: (url: string, config?: any) => getApiInstance().get(url, config),
  post: (url: string, data?: any, config?: any) =>
    getApiInstance().post(url, data, config),
  put: (url: string, data?: any, config?: any) =>
    getApiInstance().put(url, data, config),
  patch: (url: string, data?: any, config?: any) =>
    getApiInstance().patch(url, data, config),
  delete: (url: string, config?: any) => getApiInstance().delete(url, config),
};

export default getApiInstance();
