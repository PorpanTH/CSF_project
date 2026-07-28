import { Order } from '../types'
import { CATEGORICAL, BRAND, STATUS } from '../theme/colors'

interface OrderHistoryTableProps {
  orders: Order[]
}

const BADGE: Record<Order['type'], { label: string; color: string }> = {
  buy: { label: 'Buy', color: CATEGORICAL.slot1 },
  sell: { label: 'Sell', color: CATEGORICAL.slot3 },
  withdrawal: { label: 'Withdrawal', color: BRAND[700] },
}

const STATUS_BADGE: Record<Order['status'], { label: string; color: string }> = {
  completed: { label: 'Completed', color: STATUS.good },
  processing: { label: 'Processing', color: STATUS.warning },
  pending: { label: 'Pending', color: STATUS.neutralMidpointDark },
}

export const OrderHistoryTable = ({ orders }: OrderHistoryTableProps) => {
  const sorted = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Order History</h3>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-2 pb-2 font-medium">Date</th>
              <th className="px-2 pb-2 font-medium">Type</th>
              <th className="px-2 pb-2 font-medium">Ticker</th>
              <th className="px-2 pb-2 font-medium text-right">Quantity</th>
              <th className="px-2 pb-2 font-medium text-right">Price</th>
              <th className="px-2 pb-2 font-medium text-right">Total</th>
              <th className="px-2 pb-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(order => {
              const badge = BADGE[order.type]
              const statusBadge = STATUS_BADGE[order.status]
              return (
                <tr key={order.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-2 py-2.5 text-gray-600">
                    {new Date(order.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </td>
                  <td className="px-2 py-2.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 font-medium text-gray-900">{order.ticker ?? '—'}</td>
                  <td className="px-2 py-2.5 text-right text-gray-700">{order.quantity ?? '—'}</td>
                  <td className="px-2 py-2.5 text-right text-gray-700">
                    {order.price !== undefined ? `$${order.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td className="px-2 py-2.5 text-right font-semibold text-gray-900">
                    ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                      style={{ backgroundColor: statusBadge.color }}
                    >
                      {statusBadge.label}
                    </span>
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-6">No trades yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
