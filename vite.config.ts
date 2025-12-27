import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // بورت مخصص للداشبورد
    host: true, // للوصول من الشبكة المحلية
    strictPort: false, // إذا كان البورت مشغول، جرب بورت آخر
    proxy: {
      "/api-proxy": {
        // الـ target يأخذ القيمة من apiConfig.baseURL تلقائياً
        target: "http://192.168.1.102:3000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          // إزالة /api-proxy من المسار وإرسال باقي المسار للخادم
          return path.replace(/^\/api-proxy/, "");
        },
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
    },
  },
  preview: {
    port: 3000, // بورت للـ preview أيضاً
  },
});
