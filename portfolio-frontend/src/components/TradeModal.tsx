import { useState } from 'react'
import { STATUS, BRAND } from '../theme/colors'

interface TradeModalProps {
  mode: 'buy' | 'sell'
  ticker: string
  name?: string
  price: number
  maxQuantity?: number
  availableBalance?: number
  onConfirm: (quantity: number, date?: string, price?: number) => void
  onClose: () => void
}

export const TradeModal = ({ mode, ticker, name, price, maxQuantity, availableBalance, onConfirm, onClose }: TradeModalProps) => {
  const [quantity, setQuantity] = useState<number>(1)
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))
  const [entryPrice, setEntryPrice] = useState<number>(price)
  const total = quantity * (mode === 'buy' ? entryPrice : price)

  const error =
    quantity <= 0 ? 'Enter a quantity greater than 0' :
    mode === 'buy' && (!entryDate || Number.isNaN(entryPrice) || entryPrice <= 0) ? 'Provide a valid buy date and buy price' :
    mode === 'buy' && availableBalance !== undefined && total > availableBalance ? 'Insufficient available balance' :
    mode === 'sell' && maxQuantity !== undefined && quantity > maxQuantity ? `You only hold ${maxQuantity} shares` :
    null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'buy' ? 'Buy' : 'Sell'} {ticker}
          </h2>
          {name && <p className="text-sm text-gray-500">{name}</p>}

          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Market price</span>
              <span className="font-medium text-gray-900">${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                max={mode === 'sell' ? maxQuantity : undefined}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value || '0', 10)))}
                className="input-field"
              />
              {mode === 'sell' && maxQuantity !== undefined && (
                <p className="text-xs text-gray-400 mt-1">You hold {maxQuantity} shares</p>
              )}
            </div>

            {mode === 'buy' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Buy date</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Buy price per share</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </>
            )}

            <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
              <span className="text-gray-600">{mode === 'buy' ? 'Total cost' : 'Total proceeds'}</span>
              <span className="font-bold text-gray-900">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            {availableBalance !== undefined && (
              <div className="flex justify-between text-xs text-gray-400">
                <span>Available balance</span>
                <span>${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {error && <p className="text-xs font-medium" style={{ color: STATUS.critical }}>{error}</p>}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => !error && onConfirm(quantity, entryDate, mode === 'buy' ? entryPrice : price)}
              disabled={!!error}
              className="flex-1 btn text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: mode === 'buy' ? BRAND[700] : STATUS.good }}
            >
              Confirm {mode === 'buy' ? 'Buy' : 'Sell'}
            </button>
            <button onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
