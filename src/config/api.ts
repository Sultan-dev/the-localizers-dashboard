// إعدادات الـ API
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.1.128:8000";

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, 
};

export default apiConfig;
