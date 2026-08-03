import { useState } from 'react'
import { X } from 'lucide-react'
import { PortfolioItem } from '../types'

interface AddItemFormProps {
  onSubmit: (item: Omit<PortfolioItem, 'id' | 'portfolioId' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  initialData?: PortfolioItem
}

export const AddItemForm = ({ onSubmit, onCancel, initialData }: AddItemFormProps) => {
  const [formData, setFormData] = useState({
    itemType: initialData?.itemType || 'stock' as const,
    ticker: initialData?.ticker || '',
    quantity: initialData?.quantity || 0,
    purchasePrice: initialData?.purchasePrice || 0,
    purchaseDate: initialData?.purchaseDate || new Date().toISOString().split('T')[0],
    currentPrice: initialData?.currentPrice || 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker is required'
    } else if (!/^[A-Z]+$/.test(formData.ticker)) {
      newErrors.ticker = 'Ticker should contain only uppercase letters'
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0'
    }

    if (formData.currentPrice <= 0) {
      newErrors.currentPrice = 'Current price must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        ticker: formData.ticker.toUpperCase(),
        sector: 'Unclassified',
        region: 'Unclassified',
        priceHistory: [formData.currentPrice],
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'itemType' ? value : name.includes('Price') || name === 'quantity' ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Type
            </label>
            <select
              name="itemType"
              value={formData.itemType}
              onChange={handleChange}
              className="input-field"
            >
              <option value="stock">Stock</option>
              <option value="bond">Bond</option>
              <option value="etf">ETF</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticker Symbol
            </label>
            <input
              type="text"
              name="ticker"
              value={formData.ticker}
              onChange={handleChange}
              placeholder="e.g., AAPL"
              className="input-field"
            />
            {errors.ticker && <p className="text-red-600 text-sm mt-1">{errors.ticker}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                step="0.01"
                className="input-field"
              />
              {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                step="0.01"
                className="input-field"
              />
              {errors.purchasePrice && <p className="text-red-600 text-sm mt-1">{errors.purchasePrice}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Price
            </label>
            <input
              type="number"
              name="currentPrice"
              value={formData.currentPrice}
              onChange={handleChange}
              step="0.01"
              className="input-field"
            />
            {errors.currentPrice && <p className="text-red-600 text-sm mt-1">{errors.currentPrice}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {initialData ? 'Update Item' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
