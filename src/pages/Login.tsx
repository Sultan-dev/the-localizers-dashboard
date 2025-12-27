import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import { authService } from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.token) {
        setCookie("token", response.token, { path: "/" });
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message ||
          "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-600 mb-2">
              تسجيل الدخول
            </h2>
            <p className="text-gray-600">مرحباً بك في لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
