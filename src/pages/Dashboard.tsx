import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            مرحباً بك في لوحة التحكم
          </h1>
          <p className="text-gray-600">إدارة محتوى موقعك بسهولة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/cards" className="card hover:scale-105 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="text-5xl group-hover:scale-110 transition-transform">
                🃏
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-600 mb-1">
                  إدارة الكاردات
                </h3>
                <p className="text-gray-600">
                  أضف، عدّل، أو احذف الكاردات الخاصة بك
                </p>
              </div>
            </div>
          </Link>

          <Link to="/contacts" className="card hover:scale-105 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="text-5xl group-hover:scale-110 transition-transform">
                📧
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-600 mb-1">
                  معلومات التواصل
                </h3>
                <p className="text-gray-600">
                  عرض جميع رسائل التواصل القادمة من الموقع
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="card mt-8">
          <h2 className="text-2xl font-bold text-primary-600 mb-4">
            إحصائيات سريعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary-600">0</div>
              <div className="text-gray-600 mt-1">الكاردات</div>
            </div>
            <div className="bg-primary-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary-600">0</div>
              <div className="text-gray-600 mt-1">رسائل التواصل</div>
            </div>
            <div className="bg-primary-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary-600">100%</div>
              <div className="text-gray-600 mt-1">جاهزية النظام</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard

