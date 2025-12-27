import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  date: string
}

const Contacts = () => {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      // في التطبيق الحقيقي، استبدل هذا بـ API endpoint
      const stored = localStorage.getItem('contacts')
      return stored ? JSON.parse(stored) : []
    },
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-600">معلومات التواصل</h1>
          <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow">
            العدد الإجمالي: {contacts.length}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              لا توجد رسائل تواصل بعد
            </h3>
            <p className="text-gray-600">
              سيتم عرض جميع رسائل التواصل القادمة من الموقع هنا
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact: Contact) => (
              <div key={contact.id} className="card hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-primary-600">
                          {contact.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(contact.date).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">📧 البريد:</span>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-semibold">📱 الهاتف:</span>
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="bg-primary-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {contact.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Demo Data Button */}
        {contacts.length === 0 && (
          <div className="card bg-primary-50 border-2 border-primary-200">
            <p className="text-sm text-primary-700 text-center mb-4">
              💡 للاختبار: يمكنك إضافة بيانات تجريبية من خلال console
            </p>
            <button
              onClick={() => {
                const demoContacts: Contact[] = [
                  {
                    id: '1',
                    name: 'أحمد محمد',
                    email: 'ahmed@example.com',
                    phone: '+966501234567',
                    message: 'مرحباً، أريد الاستفسار عن الخدمات المتاحة لديكم.',
                    date: new Date().toISOString(),
                  },
                  {
                    id: '2',
                    name: 'فاطمة علي',
                    email: 'fatima@example.com',
                    message: 'شكراً لكم على الخدمة المميزة. أود الحصول على مزيد من المعلومات.',
                    date: new Date(Date.now() - 86400000).toISOString(),
                  },
                ]
                localStorage.setItem('contacts', JSON.stringify(demoContacts))
                window.location.reload()
              }}
              className="btn-secondary w-full"
            >
              إضافة بيانات تجريبية
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Contacts

