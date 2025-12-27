import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Layout from "../components/Layout";

interface Card {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

const Cards = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
  });
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

  // Fetch cards
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["cards"],
    queryFn: async () => {
      // في التطبيق الحقيقي، استبدل هذا بـ API endpoint
      const stored = localStorage.getItem("cards");
      return stored ? JSON.parse(stored) : [];
    },
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (card: Omit<Card, "id"> & { id?: string }) => {
      // في التطبيق الحقيقي، استبدل هذا بـ API endpoint
      const stored = localStorage.getItem("cards");
      const existingCards: Card[] = stored ? JSON.parse(stored) : [];

      if (card.id) {
        // Update
        const updated = existingCards.map((c) =>
          c.id === card.id ? { ...card, id: card.id } : c
        );
        localStorage.setItem("cards", JSON.stringify(updated));
        return updated;
      } else {
        // Create
        const newCard: Card = {
          ...card,
          id: Date.now().toString(),
        };
        const updated = [...existingCards, newCard];
        localStorage.setItem("cards", JSON.stringify(updated));
        return updated;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success(
        editingCard ? "تم تحديث الكارد بنجاح" : "تم إضافة الكارد بنجاح"
      );
      setIsModalOpen(false);
      resetForm();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // في التطبيق الحقيقي، استبدل هذا بـ API endpoint
      const stored = localStorage.getItem("cards");
      const existingCards: Card[] = stored ? JSON.parse(stored) : [];
      const updated = existingCards.filter((c) => c.id !== id);
      localStorage.setItem("cards", JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success("تم حذف الكارد بنجاح");
    },
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", image: "", link: "" });
    setSelectedImage(null);
    setImagePreview("");
    setEditingCard(null);
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      description: card.description,
      image: card.image,
      link: card.link,
    });
    setSelectedImage(null);
    setImagePreview(card.image || "");
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

      // إنشاء preview للصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setFormData({ ...formData, image: "" });
    // إعادة تعيين input file
    const fileInput = document.getElementById(
      "image-input"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // إذا كانت هناك صورة جديدة مختارة، نحولها إلى base64
    let imageUrl = formData.image;
    if (selectedImage) {
      // في التطبيق الحقيقي، يجب رفع الصورة للخادم أولاً
      // هنا سنستخدم base64 كحل مؤقت
      const reader = new FileReader();
      reader.onloadend = () => {
        imageUrl = reader.result as string;
        mutation.mutate({
          ...formData,
          image: imageUrl,
          id: editingCard?.id,
        });
      };
      reader.readAsDataURL(selectedImage);
      return;
    }

    mutation.mutate({
      ...formData,
      image: imageUrl,
      id: editingCard?.id,
    });
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
      deleteMutation.mutate(deleteConfirm.cardId);
      setDeleteConfirm({ isOpen: false, cardId: null, cardTitle: "" });
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
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🖼️
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-primary-600 mb-2">
                  {card.title}
                </h3>
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
                    onClick={() => handleDelete(card.id, card.title)}
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

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      &quot;{deleteConfirm.cardTitle}&quot;
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
