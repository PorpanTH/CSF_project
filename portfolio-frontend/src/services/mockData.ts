import { Portfolio, PnLRange, PnLSeriesPoint, HoldingFluctuation, BreakdownSlice, PortfolioItem } from '../types'

const priceHistory = (current: number, points = 30, volatility = 0.02) => {
  const history: number[] = []
  let price = current * (1 - volatility * points * 0.3)
  for (let i = 0; i < points; i++) {
    price = price * (1 + (Math.random() - 0.48) * volatility)
    history.push(Math.round(price * 100) / 100)
  }
  history[history.length - 1] = current
  return history
}

const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    name: 'Primary Investment Portfolio',
    description: 'My main investment portfolio focused on long-term growth',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-23T10:00:00Z',
    items: [
      {
        id: 'item-1', portfolioId: '1', itemType: 'stock', ticker: 'AAPL',
        quantity: 50, purchasePrice: 150.25, purchaseDate: '2023-06-15', currentPrice: 228.45,
        createdAt: '2023-06-15T10:00:00Z', updatedAt: '2024-07-23T10:00:00Z',
        sector: 'Technology', region: 'North America',
        priceHistory: priceHistory(228.45),
      },
      {
        id: 'item-2', portfolioId: '1', itemType: 'stock', ticker: 'MSFT',
        quantity: 30, purchasePrice: 310.50, purchaseDate: '2023-08-20', currentPrice: 417.89,
        createdAt: '2023-08-20T10:00:00Z', updatedAt: '2024-07-23T10:00:00Z',
        sector: 'Technology', region: 'North America',
        priceHistory: priceHistory(417.89),
      },
      {
        id: 'item-3', portfolioId: '1', itemType: 'stock', ticker: 'GOOGL',
        quantity: 25, purchasePrice: 100.00, purchaseDate: '2023-09-10', currentPrice: 155.62,
        createdAt: '2023-09-10T10:00:00Z', updatedAt: '2024-07-23T10:00:00Z',
        sector: 'Technology', region: 'North America',
        priceHistory: priceHistory(155.62),
      },
      {
        id: 'item-9', portfolioId: '1', itemType: 'stock', ticker: 'ASML',
        quantity: 10, purchasePrice: 550.00, purchaseDate: '2023-11-02', currentPrice: 680.30,
        createdAt: '2023-11-02T10:00:00Z', updatedAt: '2024-07-23T10:00:00Z',
        sector: 'Technology', region: 'Europe',
        priceHistory: priceHistory(680.30),
      },
      {
        id: 'item-10', portfolioId: '1', itemType: 'stock', ticker: 'TSM',
        quantity: 40, purchasePrice: 90.00, purchaseDate: '2024-01-18', currentPrice: 165.20,
        createdAt: '2024-01-18T10:00:00Z', updatedAt: '2024-07-23T10:00:00Z',
        sector: 'Technology', region: 'Asia',
        priceHistory: priceHistory(165.20),
      },
      {
        id: 'item-4', portfolioId: '1', itemType: 'bond', ticker: 'VBTLX',
        quantity: 100, purchasePrice: 75.00, purchaseDate: '2023-07-01', currentPrice: 76.50,
        createdAt: '2023-07-01T10:00:00Z', updatedAt: '2024-07-23T10:00:00Z',
        sector: 'Fixed Income', region: 'North America',
        priceHistory: priceHistory(76.50, 30, 0.005),
      },
      {
        id: 'item-5', portfolioId: '1', itemType: 'cash', ticker: 'CASH',
        quantity: 5000, purchasePrice: 1.0, purchaseDate: '2024-07-20', currentPrice: 1.0,
        createdAt: '2024-07-20T10:00:00Z', updatedAt: '2024-07-23T10:00:00Z',
        sector: 'Cash & Equivalents', region: 'North America',
        priceHistory: priceHistory(1.0, 30, 0),
      },
    ]
  },
  {
    id: '2',
    name: 'Conservative Portfolio',
    description: 'Low-risk portfolio for retirement savings',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-07-23T10:00:00Z',
    items: [
      {
        id: 'item-6', portfolioId: '2', itemType: 'bond', ticker: 'BND',
        quantity: 200, purchasePrice: 79.50, purchaseDate: '2024-01-15', currentPrice: 81.20,
        createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-07-23T10:00:00Z',
        sector: 'Fixed Income', region: 'North America',
        priceHistory: priceHistory(81.20, 30, 0.005),
      },
      {
        id: 'item-11', portfolioId: '2', itemType: 'bond', ticker: 'BNDX',
        quantity: 150, purchasePrice: 48.00, purchaseDate: '2024-02-10', currentPrice: 49.10,
        createdAt: '2024-02-10T10:00:00Z', updatedAt: '2024-07-23T10:00:00Z',
        sector: 'Fixed Income', region: 'Europe',
        priceHistory: priceHistory(49.10, 30, 0.005),
      },
      {
        id: 'item-7', portfolioId: '2', itemType: 'stock', ticker: 'VTI',
        quantity: 75, purchasePrice: 220.00, purchaseDate: '2024-02-01', currentPrice: 245.30,
        createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-07-23T10:00:00Z',
        sector: 'Diversified Equity', region: 'North America',
        priceHistory: priceHistory(245.30),
      },
      {
        id: 'item-8', portfolioId: '2', itemType: 'cash', ticker: 'CASH',
        quantity: 10000, purchasePrice: 1.0, purchaseDate: '2024-07-15', currentPrice: 1.0,
        createdAt: '2024-07-15T10:00:00Z', updatedAt: '2024-07-23T10:00:00Z',
        sector: 'Cash & Equivalents', region: 'North America',
        priceHistory: priceHistory(1.0, 30, 0),
      },
    ]
  }
]

export const getMockPortfolios = (): Portfolio[] => {
  return JSON.parse(JSON.stringify(mockPortfolios))
}

export const getMockPortfolioById = (id: string): Portfolio | undefined => {
  return JSON.parse(JSON.stringify(mockPortfolios.find(p => p.id === id)))
}

export const calculateMetrics = (portfolio: Portfolio) => {
  const items = portfolio.items

  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.currentPrice), 0)
  const totalInvested = items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0)
  const totalGainLoss = totalValue - totalInvested
  const percentageReturn = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0
  const dayChange = totalValue * 0.02
  const dayChangePercent = 0.85

  return {
    totalValue,
    totalInvested,
    totalGainLoss,
    percentageReturn,
    dayChange,
    dayChangePercent
  }
}

export const getAllocationData = (portfolio: Portfolio) => {
  const allocation = {
    stock: 0,
    bond: 0,
    cash: 0,
    etf: 0,
    other: 0
  }

  portfolio.items.forEach(item => {
    const value = item.quantity * item.currentPrice
    allocation[item.itemType] += value
  })

  const totalValue = allocation.stock + allocation.bond + allocation.cash + allocation.etf + allocation.other

  return [
    { type: 'stock' as const, value: allocation.stock, percentage: totalValue > 0 ? (allocation.stock / totalValue) * 100 : 0, count: portfolio.items.filter(i => i.itemType === 'stock').length },
    { type: 'bond' as const, value: allocation.bond, percentage: totalValue > 0 ? (allocation.bond / totalValue) * 100 : 0, count: portfolio.items.filter(i => i.itemType === 'bond').length },
    { type: 'cash' as const, value: allocation.cash, percentage: totalValue > 0 ? (allocation.cash / totalValue) * 100 : 0, count: portfolio.items.filter(i => i.itemType === 'cash').length },
    { type: 'etf' as const, value: allocation.etf, percentage: totalValue > 0 ? (allocation.etf / totalValue) * 100 : 0, count: portfolio.items.filter(i => i.itemType === 'etf').length },
    { type: 'other' as const, value: allocation.other, percentage: totalValue > 0 ? (allocation.other / totalValue) * 100 : 0, count: portfolio.items.filter(i => i.itemType === 'other').length },
  ].filter(entry => entry.value > 0)
}

export const getHistoricalData = (days: number = 30) => {
  const data = []
  const today = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const baseValue = 50000
    const variance = Math.sin(i / 5) * 5000 + Math.random() * 2000

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: baseValue + variance + (i * 200),
      change: Math.random() > 0.5 ? '+' : '-' + (Math.random() * 500).toFixed(2)
    })
  }

  return data
}

// --- Live-portfolio aggregate helpers (operate on the active portfolio's items[], not the static mocks) ---

const ASSET_CLASS_LABELS: Record<PortfolioItem['itemType'], string> = {
  stock: 'Stocks',
  bond: 'Bonds',
  cash: 'Cash',
  etf: 'ETFs',
  other: 'Other'
}

const buildSlices = (buckets: Record<string, number>): BreakdownSlice[] => {
  const total = Object.values(buckets).reduce((s, v) => s + v, 0)
  const entries = Object.entries(buckets)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])

  const top = entries.slice(0, 3)
  const rest = entries.slice(3)
  const slices: BreakdownSlice[] = top.map(([name, value]) => ({
    name, value, percentage: total > 0 ? (value / total) * 100 : 0,
  }))

  if (rest.length > 0) {
    const otherValue = rest.reduce((s, [, v]) => s + v, 0)
    slices.push({ name: 'Other', value: otherValue, percentage: total > 0 ? (otherValue / total) * 100 : 0 })
  }

  return slices
}

export const getAssetClassSlices = (items: PortfolioItem[]): BreakdownSlice[] => {
  const buckets: Record<string, number> = {}
  items.forEach(item => {
    const key = ASSET_CLASS_LABELS[item.itemType]
    buckets[key] = (buckets[key] || 0) + item.quantity * item.currentPrice
  })
  return buildSlices(buckets)
}

export const getSectorSlices = (items: PortfolioItem[]): BreakdownSlice[] => {
  const buckets: Record<string, number> = {}
  items.forEach(item => {
    buckets[item.sector] = (buckets[item.sector] || 0) + item.quantity * item.currentPrice
  })
  return buildSlices(buckets)
}

export const getRegionSlices = (items: PortfolioItem[]): BreakdownSlice[] => {
  const buckets: Record<string, number> = {}
  items.forEach(item => {
    buckets[item.region] = (buckets[item.region] || 0) + item.quantity * item.currentPrice
  })
  return buildSlices(buckets)
}


const RANGE_CONFIG: Record<PnLRange, { points: number; unit: 'hour' | 'day' | 'month' }> = {
  daily: { points: 24, unit: 'hour' },
  weekly: { points: 7, unit: 'day' },
  monthly: { points: 30, unit: 'day' },
  ytd: { points: Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000), unit: 'day' },
  '1y': { points: 52, unit: 'day' },
  '2y': { points: 24, unit: 'month' },
  '3y': { points: 36, unit: 'month' },
}

export const getAccumulatedPnLSeries = (range: PnLRange, endValue: number): PnLSeriesPoint[] => {
  const { points, unit } = RANGE_CONFIG[range]
  const points_: PnLSeriesPoint[] = []
  const startValue = endValue - Math.abs(endValue) * 0.6 - 1200
  const now = new Date()

  for (let i = points; i >= 0; i--) {
    const date = new Date(now)
    let label: string

    if (unit === 'hour') {
      date.setHours(date.getHours() - i)
      label = date.toLocaleTimeString('en-US', { hour: 'numeric' })
    } else if (unit === 'day') {
      date.setDate(date.getDate() - i * (range === '1y' ? 7 : 1))
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } else {
      date.setMonth(date.getMonth() - i)
      label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }

    const progress = (points - i) / points
    const drift = startValue + (endValue - startValue) * progress
    const noise = (Math.random() - 0.5) * Math.max(Math.abs(endValue) * 0.08, 150)
    points_.push({ date: label, accumulated: Math.round(drift + noise) })
  }

  points_[points_.length - 1].accumulated = Math.round(endValue)
  return points_
}

export const getHoldingsFluctuations = (items: PortfolioItem[]): HoldingFluctuation[] => {
  return items
    .filter(item => item.itemType !== 'cash')
    .map(item => {
      const first = item.priceHistory[0]
      const changePercent = first > 0 ? ((item.currentPrice - first) / first) * 100 : 0
      const unrealizedPnl = (item.currentPrice - item.purchasePrice) * item.quantity
      return {
        ticker: item.ticker,
        itemType: item.itemType,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        currentPrice: item.currentPrice,
        changePercent,
        unrealizedPnl,
        priceHistory: item.priceHistory,
      }
    })
}

