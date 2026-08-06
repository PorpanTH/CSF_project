import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b border-black/10 bg-[#111111] text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link to="/" className="flex items-center gap-4 transition-opacity hover:opacity-90">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#b91c1c] via-[#7f1d1d] to-[#111111] shadow-lg shadow-red-900/40 ring-1 ring-[#ef4444]/40 sm:h-20 sm:w-20">
              <img src={logo} alt="King Kong" className="h-full w-full object-contain p-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-[0.24em] uppercase text-white sm:text-2xl">King Kong</h1>
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-400 sm:text-xs">Portfolio Command</p>
            </div>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl border border-white/10 p-2 text-white transition-colors hover:bg-white/5 md:hidden"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isOpen && (
          <div className="pb-4 md:hidden">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
              Built for high-conviction capital allocation and smooth execution.
            </div>
          </div>
        )}
      </div>
    </header>
  )
}