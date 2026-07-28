import { useMemo } from 'react'
import { Order } from '../types'

interface OrderDialogProps {
  orders: Order[]
}

type OrderCounts = {
  processing: number
  completed: number
  pending: number
}

const formatOrderLabel = (order: Order) => {
  if (order.type === 'withdrawal') {
    return 'Withdrawal'
  }
  return `${order.type.toUpperCase()} ${order.ticker ?? '—'}`
}

const getStatusClasses = (status: Order['status']) => {
  return status === 'processing'
    ? 'bg-orange-100 text-orange-700'
    : 'bg-emerald-100 text-emerald-700'
}

export const OrderDialog = ({ orders }: OrderDialogProps) => {
  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [orders]
  )

  const orderCounts = useMemo<OrderCounts>(() => {
    return orders.reduce(
      (acc, order) => ({
        processing: acc.processing + (order.status === 'processing' ? 1 : 0),
        completed: acc.completed + (order.status === 'completed' ? 1 : 0),
        pending: acc.pending + (order.status === 'pending' ? 1 : 0),
      }),
      { processing: 0, completed: 0, pending: 0 }
    )
  }, [orders])

  return (
    <div className="card border border-slate-200 p-6 sticky top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Order dialog</p>
          <h2 className="text-xl font-bold text-gray-900 mt-2">Execution status</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Live orders
        </span>
      </div>

      <div className="grid gap-3 mt-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Processing</p>
          <p className="mt-2 text-2xl font-semibold text-orange-600">{orderCounts.processing}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Completed</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{orderCounts.completed}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-slate-700">{orderCounts.pending}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {sortedOrders.slice(0, 4).map(order => (
          <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{formatOrderLabel(order)}</p>
                <p className="text-xs text-slate-500">{new Date(order.date).toLocaleString()}</p>
              </div>
              <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase rounded-full ${getStatusClasses(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>{order.quantity ?? '—'} units</span>
              <span className="font-semibold text-gray-900">${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        ))}

        {sortedOrders.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-gray-500">
            No orders yet. Trades will appear here as you execute them.
          </div>
        )}
      </div>
    </div>
  )
}
