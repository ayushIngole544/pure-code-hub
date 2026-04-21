import axios from "axios";

// 🔥 Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: false,
});

// ==========================================
// 🔐 REQUEST INTERCEPTOR (ADD TOKEN)
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// 🚨 RESPONSE INTERCEPTOR (HANDLE ERRORS)
// ==========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 If token expired or invalid
    if (error.response?.status === 401) {
      console.warn("Unauthorized - Logging out");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 🔥 Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);