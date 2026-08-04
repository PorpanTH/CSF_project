import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, PieChart, Wallet } from 'lucide-react'
import { PnLOverview } from './components/PnLOverview'
import { AccumulatedPnLChart } from './components/AccumulatedPnLChart'
import { HoldingsFluctuationList } from './components/HoldingsFluctuationList'
import { MarketExplorer } from './components/MarketExplorer'
import { TradeModal } from './components/TradeModal'
import { ProductDetailModal } from './components/ProductDetailModal'
import { Toast } from './components/Toast'
import { portfolioAPI } from './services/api'
import {
  getHoldingsFluctuations,
} from './services/mockData'
import { PortfolioItem, MarketEquity, PortfolioMetrics } from './types'
import { Header } from './components/Header.tsx'

type ProductCategory = 'stock' | 'bond' | 'etf' | 'other'

interface ProductOption {
  id: string
  category: ProductCategory
  ticker: string
  name: string
  price: number
  sector: string
  region: string
  description: string
}

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const calculateWeightedAveragePurchasePrice = (
  currentPurchasePrice: number,
  currentQuantity: number,
  newPurchasePrice: number,
  newQuantity: number,
) => {
  const totalCost = (currentPurchasePrice * currentQuantity) + (newPurchasePrice * newQuantity)
  const totalQuantity = currentQuantity + newQuantity

  if (totalQuantity <= 0) {
    return newPurchasePrice
  }

  return Number((totalCost / totalQuantity).toFixed(2))
}

const MOCK_NEWS: Record<string, { title: string; source: string; summary: string }[]> = {
  AAPL: [
    {
      title: 'Apple Announces New AI Features for iPhone 16',
      source: 'TechCrunch',
      summary: 'Apple revealed groundbreaking on-device AI capabilities that will power the next generation of iPhone models, focusing on privacy and performance.',
    },
    {
      title: 'Q3 Earnings Beat Expectations Amid Strong Mac Sales',
      source: 'Bloomberg',
      summary: 'Apple reported record quarterly earnings driven by strong demand for MacBook Pro and iPad Pro. Services revenue also showed growth.',
    },
    {
      title: 'Apple Watch Gets Health Monitoring Upgrade',
      source: 'MacRumors',
      summary: 'The latest Apple Watch update introduces advanced heart monitoring and sleep tracking features approved by regulatory bodies.',
    },
  ],
  MSFT: [
    {
      title: 'Microsoft Expands Azure AI Services',
      source: 'Seeking Alpha',
      summary: 'Microsoft announced expanded Azure AI capabilities, integrating OpenAI models more deeply into enterprise offerings.',
    },
    {
      title: 'Strong Cloud Growth Drives Revenue Beat',
      source: 'MarketWatch',
      summary: 'Microsoft Cloud revenue jumped 28% YoY, surpassing analyst expectations and driving stock gains.',
    },
    {
      title: 'Windows 12 Preview Released to Developers',
      source: 'Ars Technica',
      summary: 'Microsoft released the first preview build of Windows 12 with AI-powered features and performance improvements.',
    },
  ],
  VOO: [
    {
      title: 'S&P 500 Reaches New All-Time High',
      source: 'CNBC',
      summary: 'The S&P 500 index closed at record levels as tech stocks lead the market rally.',
    },
    {
      title: 'Vanguard Reports Strong Fund Inflows',
      source: 'Reuters',
      summary: 'Vanguard saw significant inflows into its S&P 500 tracking funds as investors seek broad market exposure.',
    },
    {
      title: 'Market Analysis: Will Tech Dominance Continue?',
      source: 'The Wall Street Journal',
      summary: 'Analysts debate whether technology companies will continue driving market gains in the coming quarters.',
    },
  ],
  AGG: [
    {
      title: 'Bond Market Stabilizes as Rate Outlook Shifts',
      source: 'Financial Times',
      summary: 'The broader bond market showed resilience as investors reassessed expectations for future interest rate cuts.',
    },
    {
      title: 'iShares Core Bond ETF Attracts Record Assets',
      source: 'Yahoo Finance',
      summary: 'The AGG ETF surpassed $300 billion in assets under management, reflecting strong investor demand for fixed-income exposure.',
    },
    {
      title: 'Credit Spreads Narrow on Economic Optimism',
      source: 'Trading Economics',
      summary: 'Investment-grade credit spreads tightened as corporate earnings reports beat expectations.',
    },
  ],
  ALT: [
    {
      title: 'Alternative Credit Funds Outperform Traditional Bonds',
      source: 'Institutional Investor',
      summary: 'Alternative credit strategies delivered strong returns in the first half of 2024, outpacing traditional fixed income.',
    },
    {
      title: 'Private Credit Market Continues to Expand',
      source: 'Private Equity News',
      summary: 'The alternative credit market reached new size milestones as institutional investors increase allocations.',
    },
    {
      title: 'Risk Management in Alternative Investing',
      source: 'Harvard Business Review',
      summary: 'A comprehensive look at how sophisticated investors manage risk in alternative credit portfolios.',
    },
  ],
}

const PRODUCT_OPTIONS: ProductOption[] = [
  { id: 'aapl', category: 'stock', ticker: 'AAPL', name: 'Apple Inc.', price: 228.45, sector: 'Technology', region: 'North America', description: 'Mega-cap growth leader' },
  { id: 'msft', category: 'stock', ticker: 'MSFT', name: 'Microsoft Corp.', price: 417.89, sector: 'Technology', region: 'North America', description: 'Enterprise cloud and software' },
  { id: 'voo', category: 'etf', ticker: 'VOO', name: 'Vanguard S&P 500 ETF', price: 412.18, sector: 'Diversified Equity', region: 'North America', description: 'Broad equity market exposure' },
  { id: 'agg', category: 'bond', ticker: 'AGG', name: 'iShares Core Bond ETF', price: 95.75, sector: 'Fixed Income', region: 'North America', description: 'Core fixed-income allocation' },
  { id: 'alt', category: 'other', ticker: 'ALT', name: 'Private Credit Fund', price: 102.60, sector: 'Alternative Credit', region: 'Europe', description: 'Higher-income alternative sleeve' },
]

export default function App() {
  const [portfolioId, setPortfolioId] = useState<string | null>(null)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTrade, setActiveTrade] = useState<{
    mode: 'buy' | 'sell'
    ticker: string
    itemType?: PortfolioItem['itemType']
    name?: string
    price: number
    maxQuantity?: number
    availableBalance?: number
    sector?: string
    region?: string
  } | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<{ ticker: string; equity: MarketEquity; product: ProductOption } | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    void loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    try {
      setIsLoading(true)
      const portfolios = await portfolioAPI.getAll()
      const portfolio = portfolios.find(item => item.id === '1') ?? portfolios[0]

      if (!portfolio) {
        throw new Error('No portfolios available')
      }

      setPortfolioId(portfolio.id)
      setItems(portfolio.items)
      setPortfolioMetrics(portfolio.metrics ?? null)
    } catch (error) {
      setToast({ message: 'Failed to load portfolio from the backend.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const persistItems = async (previousItems: PortfolioItem[], nextItems: PortfolioItem[]) => {
    if (!portfolioId) {
      throw new Error('Portfolio is not loaded yet')
    }

    const previousById = new Map(previousItems.map(item => [item.id, item]))
    const nextById = new Map(nextItems.map(item => [item.id, item]))

    for (const previousItem of previousItems) {
      if (!nextById.has(previousItem.id)) {
        await portfolioAPI.deleteItem(portfolioId, previousItem.id)
      }
    }

    const savedItems: PortfolioItem[] = []

    for (const item of nextItems) {
      const previousItem = previousById.get(item.id)
      const payload = {
        itemType: item.itemType,
        ticker: item.ticker,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        purchaseDate: item.purchaseDate,
        currentPrice: item.currentPrice,
        assetClass: item.itemType,
        sector: item.sector,
        region: item.region,
        priceHistory: item.priceHistory,
      }

      if (!previousItem) {
        const createdItem = await portfolioAPI.addItem(portfolioId, payload)
        savedItems.push(createdItem)
        continue
      }

      if (JSON.stringify(previousItem) !== JSON.stringify(item)) {
        const updatedItem = await portfolioAPI.updateItem(portfolioId, item.id, payload)
        savedItems.push(updatedItem)
        continue
      }

      savedItems.push(item)
    }

    return savedItems
  }

  const commitItems = async (nextItems: PortfolioItem[]) => {
    const previousItems = items
    const savedItems = await persistItems(previousItems, nextItems)
    setItems(savedItems)
    return savedItems
  }
  const totalPortfolioValue = portfolioMetrics?.totalValue ?? 0
  const pnl = portfolioMetrics?.pnl ?? { total: 0, byAssetClass: [] }
  const holdings = useMemo(() => getHoldingsFluctuations(items), [items])
  const marketCatalog = useMemo<MarketEquity[]>(() => PRODUCT_OPTIONS.map(product => ({
    ticker: product.ticker,
    name: product.name,
    sector: product.sector,
    region: product.region,
    price: product.price,
    changePercent: 0,
    priceHistory: [],
  })), [])


  const handleConfirmTrade = async (quantity: number) => {
    if (!activeTrade) return

    const { mode, ticker, price, maxQuantity } = activeTrade
    const timestamp = new Date().toISOString()

    if (mode === 'buy') {
      const totalCost = quantity * price

      const itemType = activeTrade.itemType ?? 'stock'
      const existing = items.find(i => i.ticker === ticker && i.itemType === itemType)
      let nextItems = items.map(i => i.itemType === 'cash' ? { ...i, quantity: Number((i.quantity - totalCost).toFixed(2)) } : i)
      if (existing) {
        const newQty = existing.quantity + quantity
        const newAvgCost = calculateWeightedAveragePurchasePrice(
          existing.purchasePrice,
          existing.quantity,
          price,
          quantity,
        )
        nextItems = nextItems.map(i => i.id === existing.id
          ? { ...i, quantity: newQty, purchasePrice: newAvgCost, currentPrice: price, updatedAt: timestamp, priceHistory: [...i.priceHistory.slice(-29), price] }
          : i
        )
      } else {
        nextItems = [
          ...nextItems,
          {
            id: uid('item'),
            portfolioId: '1',
            itemType,
            ticker,
            quantity,
            purchasePrice: price,
            purchaseDate: new Date().toISOString().slice(0, 10),
            currentPrice: price,
            createdAt: timestamp,
            updatedAt: timestamp,
            sector: activeTrade.sector ?? 'Unknown',
            region: activeTrade.region ?? 'Unknown',
            priceHistory: [price],
          },
        ]
      }

      try {
        await commitItems(nextItems)
        await loadPortfolio()
        setToast({ message: `Placed buy order for ${quantity} ${ticker}.`, type: 'success' })
      } catch (error) {
        setToast({ message: 'Failed to persist buy order to the backend.', type: 'error' })
        setActiveTrade(null)
        return
      }
    }

    if (mode === 'sell') {
      const item = items.find(i => i.ticker === ticker && i.itemType !== 'cash')
      if (!item || !item.quantity) {
        setToast({ message: 'No holdings found to sell.', type: 'error' })
        setActiveTrade(null)
        return
      }
      if (quantity > (maxQuantity ?? 0)) {
        setToast({ message: 'Sell quantity exceeds holdings.', type: 'error' })
        setActiveTrade(null)
        return
      }

      const proceeds = quantity * price
      const nextItems = items.flatMap(i => {
        if (i.id !== item.id) return [i]
        const remaining = i.quantity - quantity
        if (remaining <= 0) return []
        return [{
          ...i,
          quantity: remaining,
          updatedAt: timestamp,
          priceHistory: [...i.priceHistory.slice(-29), price],
        }]
      }).map(i => i.itemType === 'cash' ? { ...i, quantity: Number((i.quantity + proceeds).toFixed(2)) } : i)

      try {
        await commitItems(nextItems)
        await loadPortfolio()
        setToast({ message: `Placed sell order for ${quantity} ${ticker}.`, type: 'success' })
      } catch (error) {
        setToast({ message: 'Failed to persist sell order to the backend.', type: 'error' })
        setActiveTrade(null)
        return
      }
    }

    setActiveTrade(null)
  }

  const openBuyModal = (product: ProductOption) => {
    setActiveTrade({
      mode: 'buy',
      ticker: product.ticker,
      itemType: normaliseItemType(product.category),
      name: product.name,
      price: product.price,
      sector: product.sector,
      region: product.region,
    })
  }

  const openSellModal = (ticker: string) => {
    const item = items.find(i => i.ticker === ticker && i.itemType !== 'cash')
    if (!item) {
      setToast({ message: 'No holding found for this security.', type: 'error' })
      return
    }

    setActiveTrade({
      mode: 'sell',
      ticker: item.ticker,
      price: item.currentPrice,
      maxQuantity: item.quantity,
      name: item.ticker,
    })
  }

  const handleExplorerBuy = (equity: MarketEquity) => {
    const product = PRODUCT_OPTIONS.find(option => option.ticker === equity.ticker)
    if (product) {
      openBuyModal(product)
    } else {
      setToast({ message: `No market product found for ${equity.ticker}.`, type: 'error' })
    }
  }

  const handleProductDetails = (equity: MarketEquity) => {
    const product = PRODUCT_OPTIONS.find(option => option.ticker === equity.ticker)
    if (product) {
      setSelectedProduct({ ticker: equity.ticker, equity, product })
    } else {
      setToast({ message: `No details available for ${equity.ticker}.`, type: 'error' })
    }
  }

  const normaliseItemType = (category: ProductCategory): PortfolioItem['itemType'] => {
    switch (category) {
      case 'bond':
        return 'bond'
      case 'etf':
        return 'etf'
      case 'other':
        return 'other'
      default:
        return 'stock'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-700">
        Loading portfolio from backend…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mt-2">Investment Portfolio</h1>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Net asset value</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><Wallet size={20} /></div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total P/L</p>
                <p className={`text-2xl font-semibold mt-2 ${pnl.total >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${pnl.total.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
              </div>
              <div className={`rounded-2xl p-3 ${pnl.total >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><ArrowUpRight size={20} /></div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tracked assets</p>
                <p className="text-2xl font-semibold text-gray-900 mt-2">{holdings.length}</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-600"><PieChart size={20} /></div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <PnLOverview total={pnl.total} breakdown={pnl.byAssetClass} />
          {portfolioId && <AccumulatedPnLChart portfolioId={portfolioId!} endValue={pnl.total} />}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="card border border-slate-200 flex flex-col">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Buy flow</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">Search and buy financial products</h2>
                <p className="text-gray-600 mt-2">Search across available products and open a trade for the selected instrument.</p>
              </div>
            </div>

            <div className="mt-6 overflow-y-auto flex-1" style={{ maxHeight: '600px' }}>
              <MarketExplorer equities={marketCatalog} onBuy={handleExplorerBuy} onDetails={handleProductDetails} />
            </div>
          </div>

          <HoldingsFluctuationList holdings={holdings} onSell={openSellModal} />
        </div>
      </main>

      {activeTrade && (
        <TradeModal
          mode={activeTrade.mode}
          ticker={activeTrade.ticker}
          name={activeTrade.name}
          price={activeTrade.price}
          maxQuantity={activeTrade.maxQuantity}
          availableBalance={activeTrade.availableBalance}
          onConfirm={handleConfirmTrade}
          onClose={() => setActiveTrade(null)}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          ticker={selectedProduct.equity.ticker}
          name={selectedProduct.equity.name}
          sector={selectedProduct.equity.sector}
          region={selectedProduct.equity.region}
          price={selectedProduct.equity.price}
          changePercent={selectedProduct.equity.changePercent}
          priceHistory={selectedProduct.equity.priceHistory.length > 0 ? selectedProduct.equity.priceHistory : Array(30).fill(selectedProduct.equity.price)}
          news={(MOCK_NEWS[selectedProduct.equity.ticker] || []).map((n, i) => ({
            id: `news-${i}`,
            title: n.title,
            source: n.source,
            date: new Date(Date.now() - i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            summary: n.summary,
          }))}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-sm py-6 mt-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center">
            Portfolio Manager © 2024 • Built with React, TypeScript & Tailwind CSS
          </p>
        </div>
      </footer>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
