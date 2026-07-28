import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { X } from 'lucide-react'
import { STATUS, BRAND } from '../theme/colors'

interface News {
  id: string
  title: string
  source: string
  date: string
  summary: string
}

interface ProductDetailModalProps {
  ticker: string
  name: string
  sector: string
  region: string
  price: number
  changePercent: number
  priceHistory: number[]
  news: News[]
  onClose: () => void
}

export const ProductDetailModal = ({
  ticker,
  name,
  sector,
  region,
  price,
  changePercent,
  priceHistory,
  news,
  onClose,
}: ProductDetailModalProps) => {
  const positive = changePercent >= 0
  const chartData = priceHistory.map((p, i) => ({
    day: `Day ${i + 1}`,
    price: p,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded border border-gray-200 shadow-lg">
          <p className="text-xs font-medium text-gray-600">{payload[0].payload.day}</p>
          <p className="text-sm font-bold" style={{ color: BRAND[700] }}>
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{ticker}</h2>
            <p className="text-gray-600 mt-1">{name}</p>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-gray-600"><strong>Sector:</strong> {sector}</span>
              <span className="text-gray-600"><strong>Region:</strong> {region}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Price Info */}
          <div className="flex items-start gap-6">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Current Price</p>
              <p className="text-4xl font-bold text-gray-900">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">24h Change</p>
              <p
                className="text-3xl font-bold"
                style={{ color: positive ? STATUS.goodText : STATUS.critical }}
              >
                {positive ? '+' : ''}{changePercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Price History Chart */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Price History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={BRAND[700]}
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Related News */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Related News</h3>
            <div className="space-y-4">
              {news && news.length > 0 ? (
                news.map(article => (
                  <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 leading-tight">{article.title}</h4>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                          <span>{article.source}</span>
                          <span>•</span>
                          <span>{article.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-6">No news available for this product.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
