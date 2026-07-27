import { useMemo, useState } from 'react'
import { PnLOverview } from './components/PnLOverview'
import { PieBreakdownChart } from './components/PieBreakdownChart'
import { AccumulatedPnLChart } from './components/AccumulatedPnLChart'
import { HoldingsFluctuationList } from './components/HoldingsFluctuationList'
import { BalanceCard } from './components/BalanceCard'
import { MarketExplorer } from './components/MarketExplorer'
import { OrderHistoryTable } from './components/OrderHistoryTable'
import { TradeModal } from './components/TradeModal'
import { WithdrawModal } from './components/WithdrawModal'
import { Toast } from './components/Toast'
import {
  getMockPortfolioById,
  getPnLByAssetClass,
  getTotalPnL,
  getAssetClassSlices,
  getSectorSlices,
  getRegionSlices,
  getHoldingsFluctuations,
  getMarketEquities,
} from './services/mockData'
import { PortfolioItem, MarketEquity, Order } from './types'

interface TradeModalState {
  mode: 'buy' | 'sell'
  ticker: string
  name?: string
  price: number
  maxQuantity?: number
}

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export default function App() {
  const [items, setItems] = useState<PortfolioItem[]>(() => getMockPortfolioById('1')!.items)
  const [orders, setOrders] = useState<Order[]>([])
  const [extraRealized, setExtraRealized] = useState<Record<string, number>>({})
  const [tradeModal, setTradeModal] = useState<TradeModalState | null>(null)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const marketEquities = useMemo<MarketEquity[]>(() => getMarketEquities(), [])

  const cashBalance = useMemo(
    () => items.filter(i => i.itemType === 'cash').reduce((s, i) => s + i.quantity * i.currentPrice, 0),
    [items]
  )
  const pnlByAssetClass = useMemo(() => getPnLByAssetClass(items, extraRealized), [items, extraRealized])
  const totals = useMemo(() => getTotalPnL(items, extraRealized), [items, extraRealized])
  const allocationSlices = useMemo(() => getAssetClassSlices(items), [items])
  const sectorSlices = useMemo(() => getSectorSlices(items), [items])
  const regionSlices = useMemo(() => getRegionSlices(items), [items])
  const holdings = useMemo(() => getHoldingsFluctuations(items), [items])

  const openBuy = (equity: MarketEquity) =>
    setTradeModal({ mode: 'buy', ticker: equity.ticker, name: equity.name, price: equity.price })

  const openSell = (ticker: string) => {
    const item = items.find(i => i.ticker === ticker && i.itemType === 'stock')
    if (!item) return
    setTradeModal({ mode: 'sell', ticker, price: item.currentPrice, maxQuantity: item.quantity })
  }

  const handleConfirmTrade = (quantity: number) => {
    if (!tradeModal) return
    const { mode, ticker, price } = tradeModal
    const total = quantity * price

    if (mode === 'buy') {
      const cashItem = items.find(i => i.itemType === 'cash')
      if (!cashItem || cashItem.quantity < total) {
        setToast({ message: 'Insufficient available balance', type: 'error' })
        return
      }

      const existing = items.find(i => i.ticker === ticker && i.itemType === 'stock')
      let nextItems: PortfolioItem[]

      if (existing) {
        const newQty = existing.quantity + quantity
        const newAvgCost = (existing.purchasePrice * existing.quantity + price * quantity) / newQty
        nextItems = items.map(i => i.id === existing.id ? { ...i, quantity: newQty, purchasePrice: newAvgCost, currentPrice: price } : i)
      } else {
        const marketEq = marketEquities.find(e => e.ticker === ticker)
        const newItem: PortfolioItem = {
          id: uid('item'),
          portfolioId: '1',
          itemType: 'stock',
          ticker,
          quantity,
          purchasePrice: price,
          purchaseDate: new Date().toISOString().slice(0, 10),
          currentPrice: price,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sector: marketEq?.sector ?? 'Unclassified',
          region: marketEq?.region ?? 'Unclassified',
          realizedPnL: 0,
          priceHistory: marketEq?.priceHistory ?? [price],
        }
        nextItems = [...items, newItem]
      }

      nextItems = nextItems.map(i => i.itemType === 'cash' ? { ...i, quantity: i.quantity - total } : i)
      setItems(nextItems)
      setOrders(prev => [...prev, { id: uid('order'), type: 'buy', ticker, quantity, price, total, date: new Date().toISOString() }])
      setToast({ message: `Bought ${quantity} share${quantity === 1 ? '' : 's'} of ${ticker}`, type: 'success' })
    } else {
      const existing = items.find(i => i.ticker === ticker && i.itemType === 'stock')
      if (!existing || quantity > existing.quantity) {
        setToast({ message: 'Invalid sell quantity', type: 'error' })
        return
      }
      const realizedGain = (price - existing.purchasePrice) * quantity
      let nextItems = quantity === existing.quantity
        ? items.filter(i => i.id !== existing.id)
        : items.map(i => i.id === existing.id ? { ...i, quantity: i.quantity - quantity } : i)
      nextItems = nextItems.map(i => i.itemType === 'cash' ? { ...i, quantity: i.quantity + total } : i)

      setItems(nextItems)
      setExtraRealized(prev => ({ ...prev, Stocks: (prev.Stocks ?? 0) + realizedGain }))
      setOrders(prev => [...prev, { id: uid('order'), type: 'sell', ticker, quantity, price, total, date: new Date().toISOString() }])
      setToast({ message: `Sold ${quantity} share${quantity === 1 ? '' : 's'} of ${ticker}`, type: 'success' })
    }
    setTradeModal(null)
  }

  const handleWithdraw = (amount: number) => {
    const cashItem = items.find(i => i.itemType === 'cash')
    if (!cashItem || amount > cashItem.quantity) {
      setToast({ message: 'Amount exceeds available balance', type: 'error' })
      return
    }
    setItems(items.map(i => i.itemType === 'cash' ? { ...i, quantity: i.quantity - amount } : i))
    setOrders(prev => [...prev, { id: uid('order'), type: 'withdrawal', total: amount, date: new Date().toISOString() }])
    setToast({ message: `Withdrew $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, type: 'success' })
    setShowWithdraw(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — red + white brand chrome */}
      <header className="bg-gradient-to-r from-red-900 to-red-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-2 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Portfolio Manager</h1>
                <p className="text-xs text-red-100">Financial Portfolio Management</p>
              </div>
            </div>
            <nav className="flex gap-4">
              <button className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                Dashboard
              </button>
              <button className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                Portfolios
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Primary Investment Portfolio</h1>
          <p className="text-gray-600 mt-2">P/L, allocation, holdings, and trading for your current portfolio</p>
        </div>

        {/* Part 1: P/L overview */}
        <PnLOverview breakdown={pnlByAssetClass} totals={totals} />

        {/* Part 1: allocation / sector / region breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Composition</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PieBreakdownChart title="Allocation" data={allocationSlices} />
            <PieBreakdownChart title="Sector" data={sectorSlices} />
            <PieBreakdownChart title="Region" data={regionSlices} />
          </div>
        </div>

        {/* Part 1: accumulated P/L over time */}
        <AccumulatedPnLChart endValue={totals.total} />

        {/* Part 2: equity fluctuations + sell */}
        <div className="mb-8">
          <HoldingsFluctuationList holdings={holdings} onSell={openSell} />
        </div>

        {/* Trading: balance, market, order history */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trade</h2>
          <div className="space-y-6">
            <BalanceCard balance={cashBalance} onWithdraw={() => setShowWithdraw(true)} />
            <MarketExplorer equities={marketEquities} onBuy={openBuy} />
            <OrderHistoryTable orders={orders} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-sm py-6 mt-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center">
            Portfolio Manager © 2024 • Built with React, TypeScript & Tailwind CSS
          </p>
        </div>
      </footer>

      {tradeModal && (
        <TradeModal
          mode={tradeModal.mode}
          ticker={tradeModal.ticker}
          name={tradeModal.name}
          price={tradeModal.price}
          maxQuantity={tradeModal.maxQuantity}
          availableBalance={tradeModal.mode === 'buy' ? cashBalance : undefined}
          onConfirm={handleConfirmTrade}
          onClose={() => setTradeModal(null)}
        />
      )}

      {showWithdraw && (
        <WithdrawModal
          balance={cashBalance}
          onConfirm={handleWithdraw}
          onClose={() => setShowWithdraw(false)}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
