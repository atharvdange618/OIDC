import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (original.url?.includes("/auth/logout")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });
        return apiClient(original);
      } catch {
        window.location.href = "/?error=session_expired";
      }
    }

    return Promise.reject(error);
  },
);
