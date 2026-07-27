import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

export const MetricCard = ({ label, value, subtext, trend = 'neutral', icon }: MetricCardProps) => {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
  const trendBg = trend === 'up' ? 'bg-green-50' : trend === 'down' ? 'bg-red-50' : 'bg-gray-50'

  return (
    <div className={`card border-l-4 ${trend === 'up' ? 'border-green-500' : trend === 'down' ? 'border-red-500' : 'border-gray-400'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
        </div>
        {icon ? (
          <div className={`${trendBg} p-3 rounded-lg`}>
            {icon}
          </div>
        ) : (
          <div className={`${trendBg} p-3 rounded-lg`}>
            {trend === 'up' && <TrendingUp className={trendColor} size={24} />}
            {trend === 'down' && <TrendingDown className={trendColor} size={24} />}
          </div>
        )}
      </div>
    </div>
  )
}
