import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PerformanceData {
  date: string
  value: number
  change: string
}

interface PerformanceChartProps {
  data: PerformanceData[]
}

export const PerformanceChart = ({ data }: PerformanceChartProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded border border-gray-300 shadow-lg">
          <p className="text-sm font-medium text-gray-700">{payload[0].payload.date}</p>
          <p className="text-sm font-bold text-blue-600">
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500">{payload[0].payload.change}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio Value (30 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            dot={false}
            strokeWidth={2}
            isAnimationActive={true}
            name="Portfolio Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
