import apiClient from '../lib/axios'

export interface Card {
  id: string
  title: string
  description: string
  image: string
  link: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCardRequest {
  title: string
  description: string
  image: string
  link: string
}

export interface UpdateCardRequest {
  title?: string
  description?: string
  image?: string
  link?: string
}

export const cardsService = {
  // GET Get All Cards (Public)
  getAllCards: async (): Promise<Card[]> => {
    const response = await apiClient.get<Card[]>('/cards')
    return response.data
  },

  // GET Get Card by ID
  getCardById: async (id: string): Promise<Card> => {
    const response = await apiClient.get<Card>(`/cards/${id}`)
    return response.data
  },

  // POST Create Card
  createCard: async (card: CreateCardRequest): Promise<Card> => {
    const response = await apiClient.post<Card>('/cards', card)
    return response.data
  },

  // PUT Update Card
  updateCard: async (id: string, card: UpdateCardRequest): Promise<Card> => {
    const response = await apiClient.put<Card>(`/cards/${id}`, card)
    return response.data
  },

  // DELETE Delete Card
  deleteCard: async (id: string): Promise<void> => {
    await apiClient.delete(`/cards/${id}`)
  },
}

