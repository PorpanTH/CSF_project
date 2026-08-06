import { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { portfolioAPI } from '../services/api'
import { TransactionHistoryRecord } from '../types'
import { STATUS, BRAND } from '../theme/colors'

interface TransactionHistoryScreenProps {
  portfolioId: string | null
}

const TRANSACTIONS_PER_PAGE = 30

const formatCurrency = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const escapeCsvField = (value: string | number) => {
  const stringValue = String(value ?? '')
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export const TransactionHistoryScreen = ({ portfolioId }: TransactionHistoryScreenProps) => {
  const [transactions, setTransactions] = useState<TransactionHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [tickerInput, setTickerInput] = useState('')
  const [tickerFilter, setTickerFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!portfolioId) {
      setTransactions([])
      return
    }

    const loadHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const records = await portfolioAPI.getTransactionHistory(portfolioId, typeFilter === 'all' ? undefined : { type: typeFilter })
        setTransactions(records)
        setCurrentPage(1)
      } catch (loadError) {
        setError('Failed to load transaction history from the backend.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadHistory()
  }, [portfolioId, typeFilter])

  const filteredTransactions = useMemo(() => {
    const ticker = tickerFilter.trim().toUpperCase()
    if (!ticker) return transactions
    return transactions.filter((transaction) => transaction.ticker.toUpperCase().includes(ticker))
  }, [transactions, tickerFilter])

  const applyTickerFilter = () => {
    setTickerFilter(tickerInput.trim())
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const pages = new Set<number>([1, totalPages, safePage, safePage - 1, safePage + 1])
    if (safePage <= 3) {
      pages.add(2)
      pages.add(3)
      pages.add(4)
    }
    if (safePage >= totalPages - 2) {
      pages.add(totalPages - 1)
      pages.add(totalPages - 2)
      pages.add(totalPages - 3)
    }

    return Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b)
  }, [safePage, totalPages])

  const pagedTransactions = useMemo(() => {
    const startIndex = (safePage - 1) * TRANSACTIONS_PER_PAGE
    return filteredTransactions.slice(startIndex, startIndex + TRANSACTIONS_PER_PAGE)
  }, [filteredTransactions, safePage])

  const exportTransactionsCsv = () => {
    if (filteredTransactions.length === 0) {
      return
    }

    const header = [
      'Type',
      'Date',
      'Ticker',
      'Quantity',
      'Price',
      'Proceeds',
      'Cost Basis',
      'Realized P/L',
    ]

    const rows = filteredTransactions.map((transaction) => [
      transaction.type,
      transaction.date,
      transaction.ticker,
      transaction.quantity,
      transaction.price,
      transaction.proceeds,
      transaction.costBasis,
      transaction.realizedPnl,
    ])

    const csvContent = [header, ...rows]
      .map((row) => row.map((field) => escapeCsvField(field)).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    link.href = url
    link.setAttribute('download', `transactions-${typeFilter}-${stamp}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="card border border-slate-200 overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-slate-200">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">History</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">Transactions</h2>
          <p className="text-sm text-gray-500 mt-1">Read-only ledger backed by the transaction_history table.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative inline-flex items-center">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'buy' | 'sell')}
              className="appearance-none rounded-full border border-gray-200 bg-white pl-4 pr-10 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="all">All transactions</option>
              <option value="buy">Buy only</option>
              <option value="sell">Sell only</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 text-gray-500" />
          </div>

          <input
            type="text"
            placeholder="Filter by ticker..."
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyTickerFilter() }}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <button
            type="button"
            onClick={applyTickerFilter}
            className="px-3 py-2 rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:bg-slate-50"
          >
            Filter
          </button>

          <button
            type="button"
            onClick={exportTransactionsCsv}
            disabled={isLoading || filteredTransactions.length === 0}
            className="px-3 py-2 rounded-full text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: BRAND[700] }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="p-8 text-sm text-gray-500">Loading transaction history…</div>
      )}

      {!isLoading && error && (
        <div className="p-8 text-sm font-medium" style={{ color: STATUS.critical }}>
          {error}
        </div>
      )}

      {!isLoading && !error && transactions.length === 0 && (
        <div className="p-8 text-sm text-gray-500">
          No transaction history has been recorded yet.
        </div>
      )}

      {!isLoading && !error && transactions.length > 0 && filteredTransactions.length === 0 && (
        <div className="p-8 text-sm text-gray-500">
          No transactions match ticker "{tickerFilter}".
        </div>
      )}

      {!isLoading && !error && filteredTransactions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-gray-500 uppercase tracking-wide text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Ticker</th>
                <th className="px-6 py-3 font-semibold text-right">Quantity</th>
                <th className="px-6 py-3 font-semibold text-right">Price</th>
                <th className="px-6 py-3 font-semibold text-right">Proceeds</th>
                <th className="px-6 py-3 font-semibold text-right">Cost Basis</th>
                <th className="px-6 py-3 font-semibold text-right">Realized P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {pagedTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap uppercase">{transaction.type}</td>
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{transaction.date}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{transaction.ticker}</td>
                  <td className="px-6 py-4 text-right text-gray-700">{transaction.quantity}</td>
                  <td className="px-6 py-4 text-right text-gray-700">${formatCurrency(transaction.price)}</td>
                  <td className="px-6 py-4 text-right text-gray-700">${formatCurrency(transaction.proceeds)}</td>
                  <td className="px-6 py-4 text-right text-gray-700">${formatCurrency(transaction.costBasis)}</td>
                  <td className={`px-6 py-4 text-right font-semibold ${transaction.realizedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${formatCurrency(transaction.realizedPnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/40">
            <p className="text-xs text-gray-600">
              Showing {(safePage - 1) * TRANSACTIONS_PER_PAGE + 1}
              -{Math.min(safePage * TRANSACTIONS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {visiblePages.map((page, index) => {
                const previous = visiblePages[index - 1]
                const showGap = previous !== undefined && page - previous > 1

                return (
                  <div key={page} className="flex items-center gap-2">
                    {showGap && <span className="text-gray-400 px-1">...</span>}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-9 px-2 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                        safePage === page
                          ? 'border-transparent text-white'
                          : 'border-gray-200 text-gray-700 hover:bg-slate-100'
                      }`}
                      style={safePage === page ? { backgroundColor: BRAND[700] } : undefined}
                      aria-current={safePage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
