import { BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Header = () => {
  return (
    <header className="bg-gradient-to-r from-red-900 to-red-700 text-white shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex items-center h-16">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-white-600 p-2 rounded-lg">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">King Kong Portfolio Manager</h1>
              <p className="text-xs text-gray-300">Financial Portfolio Management</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
