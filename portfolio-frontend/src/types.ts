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

export type PnLRange = 'monthly' | 'ytd' | '1y' | '2y' | '3y'

export interface PnLSeriesPoint {
  date: string
  accumulated: number
}

export interface HoldingFluctuation {
  ticker: string
  itemType: 'stock' | 'bond' | 'cash'
  currentPrice: number
  changePercent: number
  priceHistory: number[]
}
