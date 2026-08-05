import axios from 'axios'
import { Portfolio, PortfolioItem, SellTransactionRequest, TransactionHistoryRecord, TransactionHistoryFilters } from '../types'

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
const API_BASE_URL = viteEnv?.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const portfolioAPI = {
  getAll: async (): Promise<Portfolio[]> => {
    const response = await apiClient.get('/portfolios')
    return response.data
  },

  getById: async (id: string): Promise<Portfolio> => {
    const response = await apiClient.get(`/portfolios/${id}`)
    return response.data
  },

  create: async (name: string, description: string): Promise<Portfolio> => {
    const response = await apiClient.post('/portfolios', { name, description })
    return response.data
  },

  update: async (id: string, name: string, description: string): Promise<Portfolio> => {
    const response = await apiClient.put(`/portfolios/${id}`, { name, description })
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/portfolios/${id}`)
  },

  addItem: async (portfolioId: string, item: Omit<PortfolioItem, 'id' | 'portfolioId' | 'createdAt' | 'updatedAt'>): Promise<PortfolioItem> => {
    const response = await apiClient.post(`/portfolios/${portfolioId}/items`, item)
    return response.data
  },

  updateItem: async (portfolioId: string, itemId: string, item: Partial<PortfolioItem>): Promise<PortfolioItem> => {
    const response = await apiClient.put(`/portfolios/${portfolioId}/items/${itemId}`, item)
    return response.data
  },

  deleteItem: async (portfolioId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/portfolios/${portfolioId}/items/${itemId}`)
  },

  recordSellTransaction: async (portfolioId: string, payload: SellTransactionRequest): Promise<TransactionHistoryRecord> => {
    const response = await apiClient.post(`/portfolios/${portfolioId}/transactions/sell`, payload)
    return response.data
  },

  getTransactionHistory: async (portfolioId: string, filters?: TransactionHistoryFilters): Promise<TransactionHistoryRecord[]> => {
    const response = await apiClient.get(`/portfolios/${portfolioId}/transactions`, { params: filters })
    return response.data
  },
}

export default apiClient
