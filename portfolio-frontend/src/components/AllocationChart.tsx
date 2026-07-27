import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { AllocationData } from '../types'

interface AllocationChartProps {
  data: AllocationData[]
}

export const AllocationChart = ({ data }: AllocationChartProps) => {
  const COLORS = {
    stock: '#3B82F6',
    bond: '#10B981',
    cash: '#F59E0B',
  }

  const chartData = data.map(d => ({
    name: `${d.type.charAt(0).toUpperCase() + d.type.slice(1)} ${d.count}`,
    value: parseFloat(d.value.toFixed(2)),
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      return (
        <div className="bg-white p-2 rounded border border-gray-300 shadow-lg">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm text-blue-600">${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Asset Allocation</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.type}`} fill={COLORS[entry.type]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {data.map(d => (
          <div key={d.type} className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 capitalize">{d.type}</p>
            <p className="text-sm font-bold text-gray-900">${d.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
            <p className="text-xs text-gray-500">{d.percentage.toFixed(1)}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
