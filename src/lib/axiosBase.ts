import axios, { AxiosInstance } from "axios";
import { showErrorToast, showSuccessToast } from "./toastHandler";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://woothomes-api-d5c4cqdhauhjd4ca.eastus2-01.azurewebsites.net";

export interface ErrorResponse {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${BASE_URL}/api`,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    async (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => {
      const method = response.config.method?.toUpperCase();
      if (method !== "GET" && response.data?.message) {
        showSuccessToast(response.data.message);
      }
      return response;
    },
    (error) => {
      const method = error.config?.method?.toUpperCase();
      let customError: ErrorResponse = {
        message: "An unknown error occurred.",
        status: error?.response?.status,
      };

      if (error.response?.data) {
        const { message, errors } = error.response.data;

        customError = {
          message: message || "Request failed",
          errors,
          status: error.response.status,
        };
      } else if (error.message) {
        customError.message = error.message;
      }

      if (method !== "GET") {
        showErrorToast(customError);
      }

      return Promise.reject(customError);
    }
  );

  return instance;
};

export const axiosBase = createAxiosInstance();

function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    const auth = localStorage.getItem("auth-storage");
    if (!auth) return null;

    try {
      const parsed = JSON.parse(auth);
      return parsed.state.token?.access_token || null;
    } catch (error) {
      console.error("Failed to parse auth-storage:", error);
      return null;
    }
  }
  return null;
}
