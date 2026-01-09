import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { usePOST } from "../hooks/useApi";
import { API_ENDPOINTS } from "../config/apiKeys";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const { handleSubmit, mutation } = usePOST(
    { email, password },
    (data) => {
      const response = data.data;
      if (response.token) {
        setCookie("token", response.token, { path: "/" });
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/dashboard");
      }
    },
    (error: any) => {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message ||
          "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى"
      );
    }
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="w-full max-w-md animate-scale-in">
        <div className="card shadow-2xl border-primary-100/50">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                <span className="text-4xl">🔐</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-3">
              تسجيل الدخول
            </h2>
            <p className="text-gray-600 text-lg">مرحباً بك في لوحة التحكم</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="أدخل بريدك الإلكتروني"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>جاري تسجيل الدخول...</span>
                </span>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
