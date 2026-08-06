import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b border-black/10 bg-[#111111] text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex items-center justify-between md:contents">
            <Link to="/" className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90 sm:gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#b91c1c] via-[#7f1d1d] to-[#111111] shadow-lg shadow-red-900/40 ring-1 ring-[#ef4444]/40 sm:h-16 sm:w-16 md:h-20 md:w-20">
                <img src={logo} alt="King Kong" className="h-full w-full object-contain p-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-[0.22em] uppercase text-white sm:text-xl md:text-2xl">King Kong</h1>
                <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-400 sm:text-[11px] md:text-xs">Portfolio Command</p>
              </div>
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-xl border border-white/10 p-2 text-white transition-colors hover:bg-white/5 md:hidden"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          <div className="mx-auto w-full max-w-xl text-center md:mx-0 md:w-auto md:max-w-none md:text-right">
            <p className="text-lg font-black uppercase tracking-[0.22em] text-white sm:text-xl md:text-2xl">
              Add, Remove, Review<span className="text-zinc-500">.</span>{' '}
              <span className="text-[#ef4444]">Roar.</span>
            </p>
            <p className="mt-1.5 text-[10px] font-medium leading-snug tracking-[0.3em] text-zinc-400 sm:text-[11px] md:text-xs">
  A portfolio manager that gives you everything you need and nothing you don&rsquo;t.
</p>
          </div>
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