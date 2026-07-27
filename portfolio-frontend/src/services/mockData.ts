import { Portfolio, PortfolioItem } from '../types'

const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    name: 'Primary Investment Portfolio',
    description: 'My main investment portfolio focused on long-term growth',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-23T10:00:00Z',
    items: [
      {
        id: 'item-1',
        portfolioId: '1',
        itemType: 'stock',
        ticker: 'AAPL',
        quantity: 50,
        purchasePrice: 150.25,
        purchaseDate: '2023-06-15',
        currentPrice: 228.45,
        createdAt: '2023-06-15T10:00:00Z',
        updatedAt: '2024-07-23T10:00:00Z',
      },
      {
        id: 'item-2',
        portfolioId: '1',
        itemType: 'stock',
        ticker: 'MSFT',
        quantity: 30,
        purchasePrice: 310.50,
        purchaseDate: '2023-08-20',
        currentPrice: 417.89,
        createdAt: '2023-08-20T10:00:00Z',
        updatedAt: '2024-07-23T10:00:00Z',
      },
      {
        id: 'item-3',
        portfolioId: '1',
        itemType: 'stock',
        ticker: 'GOOGL',
        quantity: 25,
        purchasePrice: 100.00,
        purchaseDate: '2023-09-10',
        currentPrice: 155.62,
        createdAt: '2023-09-10T10:00:00Z',
        updatedAt: '2024-07-23T10:00:00Z',
      },
      {
        id: 'item-4',
        portfolioId: '1',
        itemType: 'bond',
        ticker: 'VBTLX',
        quantity: 100,
        purchasePrice: 75.00,
        purchaseDate: '2023-07-01',
        currentPrice: 76.50,
        createdAt: '2023-07-01T10:00:00Z',
        updatedAt: '2024-07-23T10:00:00Z',
      },
      {
        id: 'item-5',
        portfolioId: '1',
        itemType: 'cash',
        ticker: 'CASH',
        quantity: 5000,
        purchasePrice: 1.0,
        purchaseDate: '2024-07-20',
        currentPrice: 1.0,
        createdAt: '2024-07-20T10:00:00Z',
        updatedAt: '2024-07-23T10:00:00Z',
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
        id: 'item-6',
        portfolioId: '2',
        itemType: 'bond',
        ticker: 'BND',
        quantity: 200,
        purchasePrice: 79.50,
        purchaseDate: '2024-01-15',
        currentPrice: 81.20,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-07-23T10:00:00Z',
      },
      {
        id: 'item-7',
        portfolioId: '2',
        itemType: 'stock',
        ticker: 'VTI',
        quantity: 75,
        purchasePrice: 220.00,
        purchaseDate: '2024-02-01',
        currentPrice: 245.30,
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-07-23T10:00:00Z',
      },
      {
        id: 'item-8',
        portfolioId: '2',
        itemType: 'cash',
        ticker: 'CASH',
        quantity: 10000,
        purchasePrice: 1.0,
        purchaseDate: '2024-07-15',
        currentPrice: 1.0,
        createdAt: '2024-07-15T10:00:00Z',
        updatedAt: '2024-07-23T10:00:00Z',
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
    cash: 0
  }

  portfolio.items.forEach(item => {
    const value = item.quantity * item.currentPrice
    allocation[item.itemType] += value
  })

  const totalValue = allocation.stock + allocation.bond + allocation.cash

  return [
    { type: 'stock' as const, value: allocation.stock, percentage: (allocation.stock / totalValue) * 100, count: portfolio.items.filter(i => i.itemType === 'stock').length },
    { type: 'bond' as const, value: allocation.bond, percentage: (allocation.bond / totalValue) * 100, count: portfolio.items.filter(i => i.itemType === 'bond').length },
    { type: 'cash' as const, value: allocation.cash, percentage: (allocation.cash / totalValue) * 100, count: portfolio.items.filter(i => i.itemType === 'cash').length },
  ]
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
