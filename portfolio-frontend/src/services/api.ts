import axios from 'axios'
import { BuyTransactionRequest, Portfolio, PortfolioItem, SellTransactionRequest, TransactionHistoryRecord, TransactionHistoryFilters } from '../types'

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

  recordBuyTransaction: async (portfolioId: string, payload: BuyTransactionRequest): Promise<TransactionHistoryRecord> => {
    const response = await apiClient.post(`/portfolios/${portfolioId}/transactions/buy`, payload)
    return response.data
  },

  getTransactionHistory: async (portfolioId: string, filters?: TransactionHistoryFilters): Promise<TransactionHistoryRecord[]> => {
    const response = await apiClient.get(`/portfolios/${portfolioId}/transactions`, { params: filters })
    return response.data
  },
}

export const marketAPI = {
  searchSymbols: async (query: string, category: string = 'all', limit: number = 25): Promise<Array<{ticker: string; name: string; type: string}>> => {
    const response = await apiClient.get('/market/symbols', {
      params: { q: query, query, category, limit }
    })

    const rawList = Array.isArray(response.data)
      ? response.data
      : response.data?.results || response.data?.symbols || response.data?.data || []

    if (!Array.isArray(rawList)) {
      return []
    }

    return rawList
      .map((item) => {
        const ticker = String(item?.ticker || item?.symbol || item?.code || '').toUpperCase().trim()
        const name = String(item?.name || item?.companyName || item?.company_name || item?.description || ticker).trim()
        const type = String(item?.type || item?.assetClass || item?.asset_class || 'stock').toLowerCase()
        const normalizedType = ['stock', 'bond', 'etf', 'other'].includes(type) ? type : 'stock'
        return { ticker, name, type: normalizedType }
      })
      .filter((item) => item.ticker)
  },

  getQuotes: async (tickers: string[]): Promise<Record<string, {price: number; dayChangePercent: number}>> => {
    const response = await apiClient.post('/market/quotes', {
      tickers,
      symbols: tickers,
    })

    const rawQuotes = response.data?.quotes || response.data || {}
    if (!rawQuotes || typeof rawQuotes !== 'object' || Array.isArray(rawQuotes)) {
      return {}
    }

    return Object.entries(rawQuotes).reduce((acc, [rawTicker, rawQuote]) => {
      const quote = (rawQuote || {}) as Record<string, unknown>
      const priceRaw = quote.price ?? quote.currentPrice ?? quote.lastPrice ?? quote.close
      const changeRaw =
        quote.dayChangePercent ??
        quote.day_change_percent ??
        quote.changePercent ??
        quote.percentChange ??
        quote.pctChange

      const price = Number(priceRaw)
      const dayChangePercent = Number(changeRaw)

      acc[String(rawTicker).toUpperCase()] = {
        price: Number.isFinite(price) ? price : 0,
        dayChangePercent: Number.isFinite(dayChangePercent) ? dayChangePercent : 0,
      }

      return acc
    }, {} as Record<string, { price: number; dayChangePercent: number }>)
  },
}

export default apiClient
