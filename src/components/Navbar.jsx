import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#rooms', label: 'Rooms' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#amenities', label: 'Amenities' },
  { href: '#location', label: 'Location' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-[1000] flex justify-between items-center px-6 py-4 transition-all duration-300',
        scrolled ? 'bg-white/98 shadow-sm backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      <a
        href="#hero"
        className={cn(
          'font-cormorant text-[1.8rem] font-bold transition-colors',
          scrolled ? 'text-deep-blue' : 'text-white'
        )}
      >
        Azayla Hotel
      </a>

      {/* Desktop */}
      <ul className="hidden md:flex gap-8 list-none m-0 p-0">
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              className={cn(
                'font-medium text-sm tracking-wide transition-colors hover:text-terracotta',
                scrolled ? 'text-deep-blue' : 'text-white'
              )}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile toggle */}
      <button
        className="md:hidden w-11 h-11 flex items-center justify-center"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open
          ? <X size={24} className={scrolled ? 'text-deep-blue' : 'text-white'} />
          : <Menu size={24} className={scrolled ? 'text-deep-blue' : 'text-white'} />
        }
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl py-6 flex flex-col items-center gap-5 md:hidden">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-deep-blue font-semibold hover:text-terracotta transition-colors text-base"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
