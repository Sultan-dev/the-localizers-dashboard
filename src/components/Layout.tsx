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
    { path: "/reviews", label: "التقييمات", icon: "⭐" },
    { path: "/contacts", label: "معلومات التواصل", icon: "📧" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-primary-100/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold">L</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                لوحة التحكم
              </h1>
            </div>
            <button
              onClick={handleLogoutClick}
              className="btn-secondary text-sm px-4 py-2"
            >
              <span className="flex items-center gap-2">
                <span>🚪</span>
                <span>تسجيل الخروج</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-md shadow-sm border-b border-primary-100/50 sticky top-[73px] z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 whitespace-nowrap relative group ${
                  location.pathname === item.path
                    ? "text-primary-600 bg-primary-50 font-semibold shadow-sm"
                    : "text-gray-600 hover:text-primary-600 hover:bg-primary-50/50"
                }`}
              >
                <span
                  className={`text-xl transition-transform duration-300 ${
                    location.pathname === item.path
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {location.pathname === item.path && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary-500 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in border border-primary-100/50">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 mb-4 shadow-md">
                  <span className="text-4xl">🚪</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  تأكيد تسجيل الخروج
                </h3>
                <p className="text-gray-600 text-lg">
                  هل أنت متأكد من تسجيل الخروج؟
                </p>
                <p className="text-sm text-gray-500 mt-3">
                  ستحتاج إلى تسجيل الدخول مرة أخرى للوصول إلى لوحة التحكم
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={cancelLogout} className="flex-1 btn-secondary">
                  إلغاء
                </button>
                <button onClick={confirmLogout} className="flex-1 btn-primary">
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
