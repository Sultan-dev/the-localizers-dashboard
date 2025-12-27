import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [, , removeCookie] = useCookies(["token"]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    removeCookie("token");
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/login");
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const navItems = [
    { path: "/dashboard", label: "الرئيسية", icon: "🏠" },
    { path: "/cards", label: "الكاردات", icon: "🃏" },
    { path: "/contacts", label: "معلومات التواصل", icon: "📧" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-600">لوحة التحكم</h1>
            <button
              onClick={handleLogoutClick}
              className="btn-secondary text-sm"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-primary-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-6 py-4 transition-all duration-200 whitespace-nowrap ${
                  location.pathname === item.path
                    ? "text-primary-600 border-b-2 border-primary-400 font-semibold"
                    : "text-gray-600 hover:text-primary-500"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
                  <span className="text-3xl">🚪</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  تأكيد تسجيل الخروج
                </h3>
                <p className="text-gray-600">هل أنت متأكد من تسجيل الخروج؟</p>
                <p className="text-sm text-gray-500 mt-2">
                  ستحتاج إلى تسجيل الدخول مرة أخرى للوصول إلى لوحة التحكم
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={cancelLogout} className="flex-1 btn-secondary">
                  إلغاء
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-primary-400 hover:bg-primary-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
