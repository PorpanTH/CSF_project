export interface PortfolioItem {
  id: string
  portfolioId: string
  itemType: 'stock' | 'bond' | 'cash'
  ticker: string
  quantity: number
  purchasePrice: number
  purchaseDate: string
  currentPrice: number
  createdAt: string
  updatedAt: string
  sector: string
  region: string
  realizedPnL: number
  priceHistory: number[]
}

export interface Portfolio {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  items: PortfolioItem[]
}

export interface PortfolioMetrics {
  totalValue: number
  totalInvested: number
  totalGainLoss: number
  percentageReturn: number
  dayChange: number
  dayChangePercent: number
}

export interface AllocationData {
  type: 'stock' | 'bond' | 'cash'
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
  realized: number
  floating: number
}

export type PnLRange = 'daily' | 'weekly' | 'monthly' | 'ytd' | '1y' | '2y' | '3y'

export interface PnLSeriesPoint {
  date: string
  accumulated: number
}

export interface HoldingFluctuation {
  ticker: string
  itemType: 'stock' | 'bond' | 'cash'
  quantity: number
  currentPrice: number
  changePercent: number
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

export type OrderType = 'buy' | 'sell' | 'withdrawal'

export interface Order {
  id: string
  type: OrderType
  ticker?: string
  quantity?: number
  price?: number
  total: number
  date: string
}
