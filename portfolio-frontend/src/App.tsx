import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, PieChart, Wallet, LayoutDashboard, ArrowLeftRight, History } from 'lucide-react'
import { PnLOverview } from './components/PnLOverview'
import { AssetAllocationChart } from './components/AssetAllocationChart'
import { AccumulatedPnLChart } from './components/AccumulatedPnLChart'
import { AddFlow } from './components/AddFlow'
import { RemoveFlow } from './components/RemoveFlow'
import { TradeModal } from './components/TradeModal'
import { SellTransactionModal } from './components/SellTransactionModal'
import { TransactionHistoryScreen } from './components/TransactionHistoryScreen'
import { Toast } from './components/Toast'
import { portfolioAPI } from './services/api'
import {
  getHoldingsFluctuations,
} from './services/mockData'
import { HoldingFluctuation, PortfolioItem, MarketEquity, PortfolioMetrics } from './types'
import { Header } from './components/Header.tsx'

type TabKey = 'dashboard' | 'trade' | 'history'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { key: 'trade', label: 'Add & Remove', icon: <ArrowLeftRight size={20} /> },
  { key: 'history', label: 'Transactions', icon: <History size={20} /> },
]

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

const findMatchingHolding = (
  holdings: PortfolioItem[],
  ticker: string,
  itemType: PortfolioItem['itemType'],
) => holdings.find(holding => holding.ticker.toUpperCase() === ticker.toUpperCase() && holding.itemType === itemType)

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard')
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
  const [activeSale, setActiveSale] = useState<HoldingFluctuation | null>(null)
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
        name: item.name,
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


  const handleConfirmTrade = async (quantity: number, entryDate?: string, entryPrice?: number) => {
    if (!activeTrade) return

    const { mode, ticker, price, maxQuantity } = activeTrade
    const timestamp = new Date().toISOString()

    if (mode === 'buy') {
      const buyDate = entryDate ?? new Date().toISOString().slice(0, 10)
      const buyPrice = entryPrice ?? price
      const totalCost = quantity * buyPrice

      const itemType = activeTrade.itemType ?? 'stock'
      const itemName = activeTrade.name ?? ticker
      const existing = findMatchingHolding(items, ticker, itemType)
      let nextItems = items.map(i => i.itemType === 'cash' ? { ...i, quantity: Number((i.quantity - totalCost).toFixed(2)) } : i)
      if (existing) {
        const newQty = existing.quantity + quantity
        const newAvgCost = calculateWeightedAveragePurchasePrice(
          existing.purchasePrice,
          existing.quantity,
          buyPrice,
          quantity,
        )
        nextItems = nextItems.map(i => i.id === existing.id
          ? { ...i, quantity: newQty, purchasePrice: newAvgCost, currentPrice: buyPrice, updatedAt: timestamp, priceHistory: [...i.priceHistory.slice(-29), buyPrice] }
          : i
        )
      } else {
        nextItems = [
          ...nextItems,
          {
            id: uid('item'),
            portfolioId: '1',
            assetClass: itemType,
            itemType,
            ticker,
            name: itemName,
            quantity,
            purchasePrice: buyPrice,
            purchaseDate: buyDate,
            currentPrice: buyPrice,
            createdAt: timestamp,
            updatedAt: timestamp,
            sector: activeTrade.sector ?? 'Unknown',
            region: activeTrade.region ?? 'Unknown',
            priceHistory: [buyPrice],
          },
        ]
      }

      try {
        await commitItems(nextItems)
        if (!portfolioId) {
          throw new Error('Portfolio is not loaded yet')
        }
        await portfolioAPI.recordBuyTransaction(portfolioId, {
          ticker,
          date: buyDate,
          price: buyPrice,
          quantity,
          itemType,
        })
        await loadPortfolio()
        setToast({ message: `Recorded buy for ${quantity} ${ticker}.`, type: 'success' })
      } catch (error) {
        setToast({ message: 'Failed to record the buy transaction.', type: 'error' })
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

  const openSellModal = (holding: HoldingFluctuation) => {
    const item = items.find(i => i.ticker === holding.ticker && i.itemType === holding.itemType)
    if (!item) {
      setToast({ message: 'No holding found for this security.', type: 'error' })
      return
    }

    setActiveSale({ ...holding, quantity: item.quantity, currentPrice: item.currentPrice })
  }

  const handleRecordSale = async (saleDate: string, soldPrice: number, quantity: number) => {
    if (!activeSale || !portfolioId) return

    const item = items.find(i => i.ticker === activeSale.ticker && i.itemType === activeSale.itemType)
    if (!item) {
      setToast({ message: 'No holding found for this security.', type: 'error' })
      setActiveSale(null)
      return
    }

    try {
      await portfolioAPI.recordSellTransaction(portfolioId, {
        ticker: item.ticker,
        date: saleDate,
        price: soldPrice,
        quantity,
      })
      await loadPortfolio()
      setToast({ message: `Recorded sale for ${quantity} ${item.ticker}.`, type: 'success' })
    } catch (error) {
      setToast({ message: 'Failed to record the sale transaction.', type: 'error' })
    } finally {
      setActiveSale(null)
    }
  }

  const handleExplorerBuy = (equity: MarketEquity) => {
    setActiveTrade({
      mode: 'buy',
      ticker: equity.ticker,
      itemType: equity.type,
      name: equity.name,
      price: equity.price,
      sector: equity.type === 'etf' ? 'Diversified Equity' : 'Technology',
      region: 'United States',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-700">
        Loading portfolio from backend…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="flex">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'border-red-700 text-red-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Net asset value</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-2">${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
                  </div>
                  <div className="rounded-2xl bg-red-50 p-3 text-red-700"><Wallet size={20} /></div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Total P/L</p>
                    <p className={`text-2xl font-semibold mt-2 ${pnl.total >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>${pnl.total.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${pnl.total >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><ArrowUpRight size={20} /></div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Tracked assets</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-2">{holdings.length}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-100 p-3 text-gray-700"><PieChart size={20} /></div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <PnLOverview total={pnl.total} breakdown={pnl.byAssetClass} />
              {portfolioId && <AccumulatedPnLChart portfolioId={portfolioId!} endValue={pnl.total} />}
            </div>

            {portfolioId && portfolioMetrics?.nav && (
              <div className="mb-8">
                <AssetAllocationChart
                  navByAssetClass={portfolioMetrics.nav.byAssetClass}
                  items={items}
                  totalValue={totalPortfolioValue}
                />
              </div>
            )}
          </div>
        )}

        {/* Add & Remove Tab */}
        {activeTab === 'trade' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Add & Remove Holdings</h1>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <AddFlow handleExplorerBuy={handleExplorerBuy} />
              <RemoveFlow holdings={holdings} handleSell={openSellModal} />
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'history' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            </div>
            <TransactionHistoryScreen portfolioId={portfolioId} />
          </div>
        )}
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

      {activeSale && (
        <SellTransactionModal
          holding={activeSale}
          onConfirm={handleRecordSale}
          onClose={() => setActiveSale(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-sm py-6 border-t border-gray-800">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
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
