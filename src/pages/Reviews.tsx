/* eslint-disable react-hooks/immutability */
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Layout from "../components/Layout";
import { useFetch, usePOST, useDelete } from "../hooks/useApi";
import { API_KEYS, API_ENDPOINTS } from "../config/apiKeys";

interface Review {
  id?: string;
  name: string;
  email?: string;
  rate: number;
  review: string;
}

const Reviews = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    reviewId: string | null;
    reviewRating: number;
  }>({
    isOpen: false,
    reviewId: null,
    reviewRating: 0,
  });

  const queryClient = useQueryClient();

  // Fetch reviews
  const { data: reviews = [], isLoading } = useFetch<Review[]>(
    API_ENDPOINTS.REVIEWS.BASE,
    API_KEYS.REVIEWS.GET_ALL
  );

  // Create/Update mutation
  const { handleSubmit, formData, setFormData, mutation } = usePOST(
    { name: "", email: "", rate: 5, review: "" },
    () => {
      queryClient.invalidateQueries({ queryKey: [API_KEYS.REVIEWS.GET_ALL] });
      toast.success(
        editingReview ? "تم تحديث التقييم بنجاح" : "تم إضافة التقييم بنجاح"
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
      queryClient.invalidateQueries({ queryKey: [API_KEYS.REVIEWS.GET_ALL] });
      toast.success("تم حذف التقييم بنجاح");
      setDeleteConfirm({ isOpen: false, reviewId: null, reviewRating: 0 });
    },
    (error: any) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحذف");
    }
  );

  const resetForm = () => {
    setFormData({ name: "", email: "", rate: 5, review: "" });
    setEditingReview(null);
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      name: review.name,
      email: review.email || "",
      rate: review.rate,
      review: review.review,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingReview && editingReview.id) {
      // Update
      handleSubmit(
        API_ENDPOINTS.REVIEWS.BY_ID(editingReview.id),
        formData,
        "PUT"
      );
    } else {
      // Create
      handleSubmit(API_ENDPOINTS.REVIEWS.BASE, formData, "POST");
    }
  };

  const handleDelete = (id: string, rating: number) => {
    setDeleteConfirm({
      isOpen: true,
      reviewId: id,
      reviewRating: rating,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.reviewId) {
      deleteItem(API_ENDPOINTS.REVIEWS.BY_ID(deleteConfirm.reviewId));
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, reviewId: null, reviewRating: 0 });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      >
        ⭐
      </span>
    ));
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-600">
            إدارة التقييمات
          </h1>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            + إضافة تقييم جديد
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              لا توجد تقييمات بعد
            </h3>
            <p className="text-gray-600 mb-4">
              ابدأ بإضافة تقييم جديد لعرضه هنا
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="btn-primary"
            >
              إضافة تقييم جديد
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: Review, index: number) => (
              <div
                key={review.id || index}
                className="card hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {review.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-primary-600">
                          {review.name}
                        </h3>
                        {review.email && (
                          <p className="text-sm text-gray-500 mt-1">
                            {review.email}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(review.rate)}
                          <span className="text-sm text-gray-500 ml-2">
                            ({review.rate}/5)
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.review && (
                      <div className="bg-primary-50 p-4 rounded-lg mt-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {review.review}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="btn-secondary text-sm"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(review.id || "", review.rate)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                    >
                      حذف
                    </button>
                  </div>
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
                    {editingReview ? "تعديل التقييم" : "إضافة تقييم جديد"}
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
                      الاسم *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input-field"
                      placeholder="أدخل الاسم"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input-field"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      التقييم (1-5) *
                    </label>
                    <select
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rate: parseInt(e.target.value),
                        })
                      }
                      className="input-field"
                      required
                    >
                      <option value={1}>1 ⭐</option>
                      <option value={2}>2 ⭐⭐</option>
                      <option value={3}>3 ⭐⭐⭐</option>
                      <option value={4}>4 ⭐⭐⭐⭐</option>
                      <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      التقييم (Review) *
                    </label>
                    <textarea
                      value={formData.review}
                      onChange={(e) =>
                        setFormData({ ...formData, review: e.target.value })
                      }
                      className="input-field min-h-[100px]"
                      placeholder="اكتب تقييمك هنا..."
                      required
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
                        : editingReview
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
                    هل أنت متأكد من حذف التقييم{" "}
                    <span className="font-semibold text-primary-600">
                      ({deleteConfirm.reviewRating} ⭐)
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

export default Reviews;
