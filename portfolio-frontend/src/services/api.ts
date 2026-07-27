import axios from 'axios'
import { Portfolio, PortfolioItem } from '../types'
import { getMockPortfolios, getMockPortfolioById } from './mockData'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
const USE_MOCK_DATA = true

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
    if (USE_MOCK_DATA) {
      return new Promise(resolve => setTimeout(() => resolve(getMockPortfolios()), 500))
    }
    const response = await apiClient.get('/portfolios')
    return response.data
  },

  getById: async (id: string): Promise<Portfolio> => {
    if (USE_MOCK_DATA) {
      const data = getMockPortfolioById(id)
      if (!data) throw new Error('Portfolio not found')
      return new Promise(resolve => setTimeout(() => resolve(data), 300))
    }
    const response = await apiClient.get(`/portfolios/${id}`)
    return response.data
  },

  create: async (name: string, description: string): Promise<Portfolio> => {
    if (USE_MOCK_DATA) {
      const newPortfolio: Portfolio = {
        id: String(Date.now()),
        name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: []
      }
      return new Promise(resolve => setTimeout(() => resolve(newPortfolio), 300))
    }
    const response = await apiClient.post('/portfolios', { name, description })
    return response.data
  },

  update: async (id: string, name: string, description: string): Promise<Portfolio> => {
    if (USE_MOCK_DATA) {
      const portfolio = getMockPortfolioById(id)
      if (!portfolio) throw new Error('Portfolio not found')
      portfolio.name = name
      portfolio.description = description
      portfolio.updatedAt = new Date().toISOString()
      return new Promise(resolve => setTimeout(() => resolve(portfolio), 300))
    }
    const response = await apiClient.put(`/portfolios/${id}`, { name, description })
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => setTimeout(() => resolve(), 300))
    }
    await apiClient.delete(`/portfolios/${id}`)
  },

  addItem: async (portfolioId: string, item: Omit<PortfolioItem, 'id' | 'portfolioId' | 'createdAt' | 'updatedAt'>): Promise<PortfolioItem> => {
    if (USE_MOCK_DATA) {
      const newItem: PortfolioItem = {
        ...item,
        id: `item-${Date.now()}`,
        portfolioId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return new Promise(resolve => setTimeout(() => resolve(newItem), 300))
    }
    const response = await apiClient.post(`/portfolios/${portfolioId}/items`, item)
    return response.data
  },

  updateItem: async (portfolioId: string, itemId: string, item: Partial<PortfolioItem>): Promise<PortfolioItem> => {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => setTimeout(() => resolve({
        ...item,
        id: itemId,
        portfolioId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as PortfolioItem), 300))
    }
    const response = await apiClient.put(`/portfolios/${portfolioId}/items/${itemId}`, item)
    return response.data
  },

  deleteItem: async (portfolioId: string, itemId: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => setTimeout(() => resolve(), 300))
    }
    await apiClient.delete(`/portfolios/${portfolioId}/items/${itemId}`)
  },
}

export default apiClient
