export interface PortfolioItem {
  id: string
  portfolioId: string
  itemType: 'stock' | 'bond' | 'cash' | 'etf' | 'other'
  ticker: string
  name: string
  quantity: number
  purchasePrice: number
  purchaseDate: string
  currentPrice: number
  createdAt: string
  updatedAt: string
  sector: string
  region: string
  priceHistory: number[]
}

export interface Order {
  id: string
  type: 'buy' | 'sell' | 'withdrawal' | 'deposit'
  ticker?: string
  quantity?: number
  price?: number
  total: number
  date: string
  status: 'completed' | 'pending' | 'processing'
}

export interface Portfolio {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  items: PortfolioItem[]
  metrics?: PortfolioMetrics
}

export interface PortfolioMetrics {
  totalValue: number
  totalInvested: number
  totalGainLoss: number
  percentageReturn: number
  dayChange: number
  dayChangePercent: number
  pnl?: {
    total: number
    byAssetClass: PnLByAssetClass[]
  }
}

export interface AllocationData {
  type: 'stock' | 'bond' | 'cash' | 'etf' | 'other'
  value: number
  percentage: number
  count: number
}

export interface BreakdownSlice {
  name: string
  value: number
  percentage: number
}

export interface PnLByAssetClass {
  assetClass: string
  pnl: number
}

export type PnLRange = 'daily' | 'weekly' | 'monthly' | 'ytd'

export interface PnLSeriesPoint {
  date: string
  accumulated: number
}

export interface HoldingFluctuation {
  ticker: string
  name: string
  itemType: 'stock' | 'bond' | 'cash' | 'etf' | 'other'
  quantity: number
  purchasePrice: number
  currentPrice: number
  changePercent: number
  unrealizedPnl: number
  priceHistory: number[]
}

export interface MarketEquity {
  ticker: string
  name: string
  sector: string
  region: string
  price: number
  changePercent: number
  priceHistory: number[]
}

