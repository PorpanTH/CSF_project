import { useMemo } from 'react'
import { PnLOverview } from './components/PnLOverview'
import { PieBreakdownChart } from './components/PieBreakdownChart'
import { AccumulatedPnLChart } from './components/AccumulatedPnLChart'
import { HoldingsFluctuationList } from './components/HoldingsFluctuationList'
import {
  getPnLByAssetClass,
  getTotalPnL,
  getAssetClassSlices,
  getSectorSlices,
  getRegionSlices,
  getHoldingsFluctuations,
} from './services/mockData'

export default function App() {
  const pnlByAssetClass = useMemo(() => getPnLByAssetClass(), [])
  const totals = useMemo(() => getTotalPnL(), [])
  const allocationSlices = useMemo(() => getAssetClassSlices(), [])
  const sectorSlices = useMemo(() => getSectorSlices(), [])
  const regionSlices = useMemo(() => getRegionSlices(), [])
  const holdings = useMemo(() => getHoldingsFluctuations(), [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — red + white brand chrome */}
      <header className="bg-gradient-to-r from-red-900 to-red-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-2 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Portfolio Manager</h1>
                <p className="text-xs text-red-100">Financial Portfolio Management</p>
              </div>
            </div>
            <nav className="flex gap-4">
              <button className="px-4 py-2 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                Dashboard
              </button>
              <button className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                Portfolios
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Portfolio Overview</h1>
          <p className="text-gray-600 mt-2">P/L, allocation, and holdings across all portfolios</p>
        </div>

        {/* Part 1: P/L overview */}
        <PnLOverview breakdown={pnlByAssetClass} totals={totals} />

        {/* Part 1: allocation / sector / region breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Composition</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PieBreakdownChart title="Allocation" data={allocationSlices} />
            <PieBreakdownChart title="Sector" data={sectorSlices} />
            <PieBreakdownChart title="Region" data={regionSlices} />
          </div>
        </div>

        {/* Part 1: accumulated P/L over time */}
        <AccumulatedPnLChart />

        {/* Part 2: equity fluctuations */}
        <HoldingsFluctuationList holdings={holdings} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-sm py-6 mt-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center">
            Portfolio Manager © 2024 • Built with React, TypeScript & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}
