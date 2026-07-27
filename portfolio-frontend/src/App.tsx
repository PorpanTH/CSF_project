import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components'
import { Dashboard } from './pages/Dashboard'
import { PortfolioDetail } from './pages/PortfolioDetail'
import { PortfolioList } from './pages/PortfolioList'
import { AddPortfolio } from './pages/AddPortfolio'

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolios" element={<PortfolioList />} />
            <Route path="/portfolio/:id" element={<PortfolioDetail />} />
            <Route path="/add-portfolio" element={<AddPortfolio />} />
          </Routes>
        </main>
        <footer className="bg-gray-900 text-gray-300 text-sm py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center">
              Portfolio Manager © 2024 • Built with React, TypeScript & Tailwind CSS • Flask API ready for integration
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}
