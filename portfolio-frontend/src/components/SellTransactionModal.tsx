import { useEffect, useState } from 'react'
import { Loader } from 'lucide-react'
import { BRAND, STATUS } from '../theme/colors'
import { HoldingFluctuation } from '../types'

interface SellTransactionModalProps {
  holding: HoldingFluctuation
  onConfirm: (saleDate: string, soldPrice: number, quantity: number) => void | Promise<void>
  onClose: () => void
}

export const SellTransactionModal = ({ holding, onConfirm, onClose }: SellTransactionModalProps) => {
  const [saleDate, setSaleDate] = useState('')
  const [quantity, setQuantity] = useState<number>(holding.quantity)
  const [soldPrice, setSoldPrice] = useState<number>(holding.currentPrice)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    setSaleDate(today)
    setQuantity(holding.quantity)
    setSoldPrice(holding.currentPrice)
  }, [holding])

  const parsedQuantity = Number(quantity)
  const parsedPrice = Number(soldPrice)
  const error =
    !saleDate ? 'Select a sale date' :
    Number.isNaN(parsedQuantity) || parsedQuantity <= 0 ? 'Enter a quantity greater than 0' :
    parsedQuantity > holding.quantity ? `You only hold ${holding.quantity} shares` :
    Number.isNaN(parsedPrice) || parsedPrice <= 0 ? 'Enter a sale price greater than 0' :
    null

  const handleConfirm = async () => {
    if (error || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onConfirm(saleDate, parsedPrice, parsedQuantity)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Record sale for {holding.ticker}</h2>
          <p className="text-sm text-gray-500 mt-1">This saves an accounting entry for the selected quantity.</p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Quantity sold</label>
              <input
                type="number"
                min="1"
                max={holding.quantity}
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={isSubmitting}
                className="input-field disabled:opacity-60"
              />
              <p className="text-xs text-gray-400 mt-1">You hold {holding.quantity} shares</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Date of sale</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                disabled={isSubmitting}
                className="input-field disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Sold price per share</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={soldPrice}
                onChange={(e) => setSoldPrice(Number(e.target.value))}
                disabled={isSubmitting}
                className="input-field disabled:opacity-60"
              />
            </div>

            <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
              <span className="text-gray-600">Estimated proceeds</span>
              <span className="font-bold text-gray-900">
                ${(parsedQuantity * parsedPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {error && <p className="text-xs font-medium" style={{ color: STATUS.critical }}>{error}</p>}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleConfirm}
              disabled={!!error || isSubmitting}
              className="flex-1 btn text-white disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              style={{ backgroundColor: BRAND[700] }}
            >
              {isSubmitting && <Loader size={14} className="animate-spin" />}
              {isSubmitting ? 'Recording…' : 'Record Sale'}
            </button>
            <button onClick={onClose} disabled={isSubmitting} className="flex-1 btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
