import { BarChart3, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-red-900 to-red-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-white-600 p-2 rounded-lg">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">King Kong Portfolio Manager</h1>
              <p className="text-xs text-gray-300">Financial Portfolio Management</p>
            </div>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-slate-700 rounded-lg"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`${isOpen ? 'block' : 'hidden'} md:block absolute md:relative top-16 md:top-0 left-0 right-0 bg-slate-900 md:bg-transparent`}>
            <ul className="flex flex-col md:flex-row gap-0 md:gap-8 p-4 md:p-0">
              <li>
                <Link to="/" className="block py-2 md:py-0 hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/portfolios" className="block py-2 md:py-0 hover:text-blue-400 transition-colors">
                  Portfolios
                </Link>
              </li>
              <li>
                <Link to="/add-portfolio" className="block py-2 md:py-0 px-4 py-2 md:py-0 bg-white-600 md:bg-white-600 rounded-lg hover:bg-black-700 transition-colors">
                  New Portfolio
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
