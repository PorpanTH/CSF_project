import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  LayoutDashboard,
  ArrowLeftRight,
  History,
  Wallet,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { PnLOverview } from './components/PnLOverview'
import { AssetAllocationChart } from './components/AssetAllocationChart'
import { TimeWeightedReturnChart } from './components/TimeWeightedReturnChart'
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

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'flow', label: 'Add & Remove', icon: ArrowLeftRight },
  { id: 'history', label: 'Transaction History', icon: History },
] as const

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
  const [portfolioId, setPortfolioId] = useState<string | null>(null)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
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

  const loadPortfolio = async (showFullScreenLoader: boolean = true) => {
    try {
      if (showFullScreenLoader) {
        setIsLoading(true)
      }
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
      if (showFullScreenLoader) {
        setIsLoading(false)
      }
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
        await loadPortfolio(false)
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
        await loadPortfolio(false)
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
      await loadPortfolio(false)
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
      maxQuantity: undefined,
      availableBalance: undefined,
      sector: equity.type === 'etf' ? 'Diversified Equity' : 'Technology',
      region: 'United States',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0] text-zinc-900">
        <div className="rounded-[28px] border border-black/10 bg-white px-8 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#991b1b]">Loading portfolio</p>
          <p className="mt-2 text-base text-zinc-700">Loading portfolio from backend…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-zinc-950">
      <Header />

      <section className="min-h-[calc(100vh-6rem)] border border-black/10 bg-white p-4 shadow-[0_18px_60px_rgba(0,0,0,0.08)] sm:p-6">
        <div className={`grid gap-5 transition-[grid-template-columns] duration-300 ${isSidebarCollapsed ? 'xl:grid-cols-[88px_minmax(0,1fr)]' : 'xl:grid-cols-[300px_minmax(0,1fr)]'}`}>
          <aside className="relative flex min-h-[calc(100vh-10rem)] flex-col rounded-[28px] bg-[#111111] p-3 shadow-[0_12px_35px_rgba(0,0,0,0.22)] transition-all duration-300">
            <button
              onClick={() => setIsSidebarCollapsed(v => !v)}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="absolute -right-3 top-6 z-10 hidden h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#1c1c1c] text-zinc-300 shadow-md transition-colors hover:bg-white/10 hover:text-white xl:flex"
            >
              {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {!isSidebarCollapsed && (
              <div className="mb-3 rounded-[22px] border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-400">Portfolio control</p>
                <p className="mt-1 text-sm font-semibold text-white">King Kong command deck</p>
              </div>
            )}

            <div className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    title={isSidebarCollapsed ? tab.label : undefined}
                    className={`flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                      isSidebarCollapsed ? 'justify-center px-3' : ''
                    } ${
                      isActive
                        ? 'bg-[#b91c1c] text-white shadow-lg shadow-red-900/20'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    {!isSidebarCollapsed && <span>{tab.label}</span>}
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="min-w-0">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <section className="grid gap-4 sm:grid-cols-5 xl:grid-cols-3">
                  <div className="rounded-[28px] border border-black/10 bg-[#111111] p-5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">Net asset value</p>
                        <p className="mt-3 text-2xl font-extrabold text-white">${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3 text-white"><Wallet size={20} /></div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Total P/L</p>
                        <p className={`mt-3 text-2xl font-extrabold ${pnl.total >= 0 ? 'text-emerald-700' : 'text-[#b91c1c]'}`}>
                          ${pnl.total.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className={`rounded-2xl p-3 ${pnl.total >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-[#b91c1c]'}`}>
                        <ArrowUpRight size={20} />
                      </div>
                    </div>
                  </div>
                </section>

      <div className="mb-8">
        {portfolioId && <TimeWeightedReturnChart portfolioId={portfolioId} />}
      </div>

      <div className="mb-8">
        <PnLOverview total={pnl.total} breakdown={pnl.byAssetClass} />
      </div>

                {portfolioId && portfolioMetrics?.nav && (
                  <section>
                    <AssetAllocationChart
                      navByAssetClass={portfolioMetrics.nav.byAssetClass}
                      items={items}
                      totalValue={totalPortfolioValue}
                    />
                  </section>
                )}
              </div>
            )}

            {activeTab === 'flow' && (
              <div className="grid gap-6 xl:grid-cols-10">
              <div className="xl:col-span-4">
                <AddFlow handleExplorerBuy={handleExplorerBuy} />
              </div>
              <div className="xl:col-span-6">
                <RemoveFlow holdings={holdings} handleSell={openSellModal} />
              </div>
            </div>
            )}

            {activeTab === 'history' && (
              <div>
                <TransactionHistoryScreen portfolioId={portfolioId} />
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#111111] py-6 text-sm text-zinc-300">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck size={16} className="text-[#ef4444]" />
            <span className="font-semibold">King Kong Portfolio</span>
          </div>
        </div>
      </footer>

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

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}