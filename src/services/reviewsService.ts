import apiClient from '../lib/axios'

export interface Review {
  id: string
  rating: number
  comment?: string
  userId?: string
  userName?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateReviewRequest {
  rating: number
  comment?: string
}

export interface UpdateReviewRequest {
  rating?: number
  comment?: string
}

export const reviewsService = {
  // GET Get All Reviews
  getAllReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>('/reviews')
    return response.data
  },

  // GET Get Review by ID
  getReviewById: async (id: string): Promise<Review> => {
    const response = await apiClient.get<Review>(`/reviews/${id}`)
    return response.data
  },

  // POST Create Review
  createReview: async (review: CreateReviewRequest): Promise<Review> => {
    const response = await apiClient.post<Review>('/reviews', review)
    return response.data
  },

  // PUT Update Review
  updateReview: async (id: string, review: UpdateReviewRequest): Promise<Review> => {
    const response = await apiClient.put<Review>(`/reviews/${id}`, review)
    return response.data
  },

  // DELETE Delete Review
  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`)
  },
}

