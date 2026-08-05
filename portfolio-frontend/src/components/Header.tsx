import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b border-black/10 bg-[#111111] text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#ef4444] via-[#b91c1c] to-[#7f1d1d] text-[15px] font-black tracking-[0.24em] text-white shadow-lg shadow-red-900/30">
              <span className="absolute inset-x-0 top-0 h-1 bg-white/40" />
              <span className="relative">KK</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-[0.24em] uppercase text-white sm:text-xl">King Kong</h1>
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-400">Portfolio Command</p>
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
