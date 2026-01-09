import { Link } from "react-router-dom";
import Layout from "../components/Layout";

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-8 animate-slide-up">
        {/* Welcome Section */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <span className="text-4xl">👋</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-3">
            مرحباً بك في لوحة التحكم
          </h1>
          <p className="text-xl text-gray-600">
            إدارة محتوى موقعك بسهولة وأمان
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/cards" className="card-hover group cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">🃏</span>
              </div>
              <h3 className="text-xl font-bold text-primary-600 mb-2 group-hover:text-primary-700 transition-colors">
                إدارة الكاردات
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                أضف، عدّل، أو احذف الكاردات الخاصة بك
              </p>
            </div>
          </Link>

          <Link to="/reviews" className="card-hover group cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-primary-600 mb-2 group-hover:text-primary-700 transition-colors">
                التقييمات
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                إدارة تقييمات المستخدمين
              </p>
            </div>
          </Link>

          <Link to="/contacts" className="card-hover group cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="text-xl font-bold text-primary-600 mb-2 group-hover:text-primary-700 transition-colors">
                معلومات التواصل
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                عرض جميع رسائل التواصل القادمة من الموقع
              </p>
            </div>
          </Link>

          <div className="card-hover group cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-primary-600 mb-2 group-hover:text-primary-700 transition-colors">
                الإحصائيات
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                عرض إحصائيات مفصلة عن الموقع
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="card mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              إحصائيات سريعة
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl text-center border border-primary-200/50 hover:shadow-md transition-all duration-300">
              <div className="text-4xl font-bold text-primary-600 mb-2">0</div>
              <div className="text-gray-700 font-medium">الكاردات</div>
              <div className="text-xs text-gray-500 mt-1">إجمالي الكاردات</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center border border-blue-200/50 hover:shadow-md transition-all duration-300">
              <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-gray-700 font-medium">رسائل التواصل</div>
              <div className="text-xs text-gray-500 mt-1">الرسائل المستلمة</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center border border-green-200/50 hover:shadow-md transition-all duration-300">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-700 font-medium">جاهزية النظام</div>
              <div className="text-xs text-gray-500 mt-1">
                جميع الأنظمة تعمل
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
