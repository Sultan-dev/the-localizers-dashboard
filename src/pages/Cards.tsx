/* eslint-disable react-hooks/immutability */
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCookies } from "react-cookie";
import axios from "axios";
import Layout from "../components/Layout";
import { useFetch, usePOST, useDelete } from "../hooks/useApi";
import { API_KEYS, API_ENDPOINTS } from "../config/apiKeys";
import apiConfig from "../config/api";

interface Card {
  id?: string;
  title: string;
  subtitle?: string;
  description: string;
  link: string;
  badge?: string;
  preview_url?: string;
  is_coming_soon?: boolean;
  order?: number;
  is_active?: boolean;
  type?: "government" | "company";
}

const Cards = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    cardId: string | null;
    cardTitle: string;
  }>({
    isOpen: false,
    cardId: null,
    cardTitle: "",
  });

  const queryClient = useQueryClient();
  const [cookies] = useCookies(["token"]);

  // Fetch cards
  const { data: cards = [], isLoading } = useFetch<Card[]>(
    API_ENDPOINTS.CARDS.BASE,
    API_KEYS.CARDS.GET_ALL
  );

  // Create/Update mutation
  const { formData, setFormData, setImages, mutation } = usePOST(
    {
      title: "",
      subtitle: "",
      description: "",
      link: "",
      badge: "",
      preview_url: "",
      is_coming_soon: false,
      order: 1,
      is_active: true,
      type: "government",
    },
    () => {
      queryClient.invalidateQueries({ queryKey: [API_KEYS.CARDS.GET_ALL] });
      toast.success(
        editingCard ? "تم تحديث الكارد بنجاح" : "تم إضافة الكارد بنجاح"
      );
      setIsModalOpen(false);
      resetForm();
    },
    (error: any) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    }
  );

  // Delete mutation
  const { deleteItem, mutation: deleteMutation } = useDelete(
    () => {
      queryClient.invalidateQueries({ queryKey: [API_KEYS.CARDS.GET_ALL] });
      toast.success("تم حذف الكارد بنجاح");
      setDeleteConfirm({ isOpen: false, cardId: null, cardTitle: "" });
    },
    (error: any) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
    }
  );

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      link: "",
      badge: "",
      preview_url: "",
      is_coming_soon: false,
      order: 1,
      is_active: true,
      type: "government",
    });
    setSelectedImage(null);
    setImages({});
    setImagePreview("");
    setEditingCard(null);
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      subtitle: card.subtitle || "",
      description: card.description,
      link: card.link,
      badge: card.badge || "",
      preview_url: card.preview_url || "",
      is_coming_soon: card.is_coming_soon || false,
      order: card.order || 1,
      is_active: card.is_active !== undefined ? card.is_active : true,
      type: card.type || "government",
    });
    setSelectedImage(null);
    setImagePreview(card.preview_url || "");
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith("image/")) {
        toast.error("يرجى اختيار ملف صورة صحيح");
        return;
      }

      // التحقق من حجم الملف (مثلاً 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة كبير جداً. الحد الأقصى 5MB");
        return;
      }

      setSelectedImage(file);
      setImages({ "0": file });

      // إنشاء preview للصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        setImagePreview(previewUrl);
        setFormData({ ...formData, preview_url: previewUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImages({});
    setImagePreview("");
    setFormData({ ...formData, preview_url: "" });
    // إعادة تعيين input file
    const fileInput = document.getElementById(
      "image-input"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // إعداد البيانات للإرسال
    const dataToSend: any = { ...formData };

    // إعداد baseURL
    let baseUrlValue = apiConfig.baseURL.trim();
    if (baseUrlValue.endsWith("/")) {
      baseUrlValue = baseUrlValue.slice(0, -1);
    }
    if (!baseUrlValue.endsWith("/api")) {
      baseUrlValue = baseUrlValue + "/api";
    }
    const baseUrl = baseUrlValue + "/";

    const url =
      editingCard && editingCard.id
        ? API_ENDPOINTS.CARDS.BY_ID(editingCard.id)
        : API_ENDPOINTS.CARDS.BASE;
    const method = editingCard && editingCard.id ? "PUT" : "POST";

    // إرسال كل البيانات كـ FormData (key:value) دائماً
    const formDataToSend = new FormData();

    // إضافة كل الحقول كـ key:value
    Object.entries(dataToSend).forEach(([key, value]) => {
      if (key === "preview_url" && selectedImage) {
        // سنضيف الصورة كـ file منفصل
        return;
      }

      if (value !== null && value !== undefined) {
        if (typeof value === "boolean") {
          formDataToSend.append(key, value ? "1" : "0");
        } else if (typeof value === "number") {
          formDataToSend.append(key, value.toString());
        } else if (typeof value === "object") {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value as string);
        }
      }
    });

    // إضافة الصورة كـ binary file إذا كانت موجودة
    if (selectedImage) {
      formDataToSend.append("preview_url", selectedImage);
    } else if (
      editingCard?.preview_url &&
      !editingCard.preview_url.startsWith("data:")
    ) {
      // إذا كانت هناك صورة موجودة مسبقاً (URL)، أضفها كـ string
      formDataToSend.append("preview_url", editingCard.preview_url);
    }

    try {
      const methodToUse = method === "PUT" ? axios.put : axios.post;

      await methodToUse(`${baseUrl}${url}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${cookies.token}`,
          Accept: "application/json",
          // لا نضيف Content-Type يدوياً، axios سيقوم بإضافتها تلقائياً مع boundary
        },
      });

      queryClient.invalidateQueries({ queryKey: [API_KEYS.CARDS.GET_ALL] });
      toast.success(
        editingCard ? "تم تحديث الكارد بنجاح" : "تم إضافة الكارد بنجاح"
      );
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    }
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteConfirm({
      isOpen: true,
      cardId: id,
      cardTitle: title,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.cardId) {
      deleteItem(API_ENDPOINTS.CARDS.BY_ID(deleteConfirm.cardId));
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, cardId: null, cardTitle: "" });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-600">
            إدارة الكاردات
          </h1>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            + إضافة كارد جديد
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🃏</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              لا توجد كاردات بعد
            </h3>
            <p className="text-gray-600 mb-4">
              ابدأ بإضافة كارد جديد لعرضه هنا
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="btn-primary"
            >
              إضافة كارد جديد
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card: Card) => (
              <div key={card.id} className="card group">
                <div className="relative mb-4 rounded-lg overflow-hidden bg-primary-100 aspect-video">
                  {card.preview_url ? (
                    <img
                      src={card.preview_url}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🖼️
                    </div>
                  )}
                  {card.badge && (
                    <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      {card.badge}
                    </div>
                  )}
                  {card.is_coming_soon && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      قريباً
                    </div>
                  )}
                </div>
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-primary-600">
                    {card.title}
                  </h3>
                  {card.subtitle && (
                    <p className="text-sm text-gray-500 mt-1">
                      {card.subtitle}
                    </p>
                  )}
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {card.description}
                </p>
                {card.link && (
                  <a
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-600 text-sm font-semibold mb-4 inline-block"
                  >
                    زيارة الرابط →
                  </a>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(card)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(card.id || "", card.title)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-600">
                    {editingCard ? "تعديل الكارد" : "إضافة كارد جديد"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      العنوان *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      العنوان الفرعي
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الوصف *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="input-field min-h-[100px]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الصورة *
                    </label>

                    {/* عرض الصورة المختارة */}
                    {imagePreview && (
                      <div className="mb-4 relative">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-primary-100 border-2 border-primary-200">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                            title="إزالة الصورة"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}

                    {/* زر اختيار الصورة */}
                    <div className="relative">
                      <input
                        id="image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-input"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 hover:bg-primary-100 cursor-pointer transition-colors"
                      >
                        <span className="text-2xl">📷</span>
                        <span className="text-primary-600 font-semibold">
                          {imagePreview
                            ? "تغيير الصورة"
                            : "اختر صورة من الملفات"}
                        </span>
                      </label>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      الصيغ المدعومة: JPG, PNG, GIF. الحد الأقصى: 5MB
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الرابط
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      className="input-field"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      النوع *
                    </label>
                    <select
                      value={formData.type || "government"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as "government" | "company",
                        })
                      }
                      className="input-field"
                      required
                    >
                      <option value="government">حكومي</option>
                      <option value="company">شركة</option>
                    </select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      {mutation.isPending
                        ? "جاري الحفظ..."
                        : editingCard
                        ? "تحديث"
                        : "إضافة"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="btn-secondary flex-1"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <span className="text-3xl">🗑️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    تأكيد الحذف
                  </h3>
                  <p className="text-gray-600">
                    هل أنت متأكد من حذف الكارد{" "}
                    <span className="font-semibold text-primary-600">
                      {deleteConfirm.cardTitle}
                    </span>
                    ؟
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    لا يمكن التراجع عن هذا الإجراء
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 btn-secondary"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleteMutation.isPending}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cards;
