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
