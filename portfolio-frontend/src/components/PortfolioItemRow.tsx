import { Trash2, Edit2 } from 'lucide-react'
import { PortfolioItem } from '../types'

interface PortfolioItemRowProps {
  item: PortfolioItem
  onEdit?: (item: PortfolioItem) => void
  onDelete?: (itemId: string) => void
}

export const PortfolioItemRow = ({ item, onEdit, onDelete }: PortfolioItemRowProps) => {
  const currentValue = item.quantity * item.currentPrice
  const investedValue = item.quantity * item.purchasePrice
  const gainLoss = currentValue - investedValue
  const gainLossPercent = (gainLoss / investedValue) * 100

  const isPositive = gainLoss >= 0
  const typeColors = {
    stock: 'bg-blue-100 text-blue-800',
    bond: 'bg-green-100 text-green-800',
    cash: 'bg-gray-100 text-gray-800',
  }

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${typeColors[item.itemType]}`}>
            {item.itemType}
          </span>
          <div>
            <p className="font-semibold text-gray-900">{item.ticker}</p>
            <p className="text-sm text-gray-500">{new Date(item.purchaseDate).toLocaleDateString()}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-medium">{item.quantity.toLocaleString()}</p>
        <p className="text-sm text-gray-500">{item.currentPrice.toFixed(2)}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-semibold text-gray-900">${investedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className="font-semibold text-gray-900">${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </td>
      <td className="px-6 py-4 text-right">
        <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          ${gainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%
        </p>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit item"
            >
              <Edit2 size={18} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete item"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
