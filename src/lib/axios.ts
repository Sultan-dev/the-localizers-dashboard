import axios from "axios";
import apiConfig from "../config/api";

// إنشاء instance من axios مع الإعدادات الافتراضية
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    "Content-Type": "application/json",
    // "ngrok-skip-browser-warning": "true",
    Accept: "application/json",
  },
  withCredentials: false,
});

// إضافة interceptor للطلبات
apiClient.interceptors.request.use(
  (config) => {
    // في وضع التطوير فقط، استخدم proxy لتجنب مشاكل CORS
    // baseURL يبقى كما هو في api.ts، لكن الطلب يمر عبر proxy
    if (import.meta.env.DEV && config.baseURL?.startsWith("http")) {
      // حفظ الـ baseURL الأصلي
      const originalBaseURL = config.baseURL;

      // استخراج المسار من baseURL إذا كان موجوداً
      try {
        const url = new URL(originalBaseURL);
        const basePath = url.pathname || "";

        // تحويل baseURL إلى proxy path
        // config.baseURL = "/api-proxy";

        // إذا كان هناك مسار في baseURL، أضفه للـ url
        if (basePath && basePath !== "/") {
          config.url = basePath + (config.url || "");
        }
      } catch {
        // إذا فشل parsing، استخدم proxy ببساطة
        // config.baseURL = "/api-proxy";
      }
    }

    // إضافة token إذا كان موجوداً
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // إضافة headers خاصة بـ ngrok
    if (apiConfig.baseURL.includes("ngrok")) {
      config.headers["ngrok-skip-browser-warning"] = "true";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// إضافة interceptor للاستجابات
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // معالجة أخطاء CORS
    if (error.code === "ERR_NETWORK" || error.message.includes("CORS")) {
      console.error("CORS Error:", error);
      return Promise.reject(
        new Error(
          "خطأ في الاتصال بالخادم. يرجى التحقق من إعدادات CORS في الخادم."
        )
      );
    }

    if (error.response?.status === 401) {
      // إعادة توجيه لصفحة تسجيل الدخول عند انتهاء الجلسة
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
