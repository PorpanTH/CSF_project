import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { portfolioAPI } from '../services/api'
import { TransactionHistoryRecord } from '../types'
import { STATUS } from '../theme/colors'

interface TransactionHistoryScreenProps {
  portfolioId: string | null
}

const formatCurrency = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const TransactionHistoryScreen = ({ portfolioId }: TransactionHistoryScreenProps) => {
  const [transactions, setTransactions] = useState<TransactionHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'sell'>('all')

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
      } catch (loadError) {
        setError('Failed to load transaction history from the backend.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadHistory()
  }, [portfolioId, typeFilter])

  return (
    <div className="rounded-3xl border border-rose-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-5 border-b border-rose-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
          <p className="text-sm text-gray-500 mt-1">Read-only ledger backed by the transaction_history table.</p>
        </div>

        <div className="relative inline-flex items-center">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'buy' | 'sell')}
            className="appearance-none rounded-full border border-rose-200 bg-rose-50 pl-4 pr-10 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="all">All transactions</option>
            <option value="buy">Buy only</option>
            <option value="sell">Sell only</option>
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 text-gray-500" />
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

      {!isLoading && !error && transactions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-rose-100 text-sm">
            <thead className="bg-rose-50/60 text-left text-gray-500 uppercase tracking-wide text-xs">
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
            <tbody className="divide-y divide-rose-50 bg-white">
              {transactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-rose-50/40 transition-colors">
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
        </div>
      )}
    </div>
  )
}
