import { useState, useEffect, useRef } from 'react'
import { Menu, X, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import { useT } from '@/hooks/useT'

const NAV_KEYS = [
  { href: '#about',     key: 'nav.about' },
  { href: '#rooms',     key: 'nav.rooms' },
  { href: '#gallery',   key: 'nav.gallery' },
  { href: '#amenities', key: 'nav.amenities' },
  { href: '#location',  key: 'nav.location' },
  { href: '#contact',   key: 'nav.contact' },
]

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'it', label: 'IT', name: 'Italiano' },
  { code: 'nl', label: 'NL', name: 'Nederlands' },
  { code: 'pt', label: 'PT', name: 'Português' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)
  const { lang, setLang } = useLanguage()
  const t = useT()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function pickLang(code) {
    setLang(code)
    setLangOpen(false)
  }

  const textColor = scrolled ? 'text-deep-blue' : 'text-white'

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-[1000] flex justify-between items-center px-6 py-4 transition-all duration-300',
        scrolled ? 'bg-white/98 shadow-sm backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      <a href="#hero" className="shrink-0">
        <img
          src="/logo-removebg-preview.png"
          alt="Azayla Hotel"
          className="h-[100px] w-auto object-contain drop-shadow-sm"
        />
      </a>

      {/* Desktop */}
      <ul className="hidden md:flex gap-8 list-none m-0 p-0 items-center">
        {NAV_KEYS.map(({ href, key }) => (
          <li key={href}>
            <a
              href={href}
              className={cn(
                'font-medium text-sm tracking-wide transition-colors hover:text-terracotta',
                textColor
              )}
            >
              {t(key)}
            </a>
          </li>
        ))}

        {/* Language picker */}
        <li className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen(v => !v)}
            className={cn(
              'flex items-center gap-1.5 font-medium text-sm tracking-wide transition-colors hover:text-terracotta',
              textColor
            )}
            aria-label="Select language"
          >
            <Globe size={15} />
            <span>{lang.toUpperCase()}</span>
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-3 w-40 bg-white rounded-xl shadow-xl border border-black/5 py-1.5 overflow-hidden">
              {LANGUAGES.map(({ code, label, name }) => (
                <button
                  key={code}
                  onClick={() => pickLang(code)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors hover:bg-stone-50',
                    lang === code ? 'text-terracotta font-semibold' : 'text-deep-blue'
                  )}
                >
                  <span className="w-7 text-xs font-bold text-stone-400">{label}</span>
                  <span>{name}</span>
                </button>
              ))}
            </div>
          )}
        </li>
      </ul>

      {/* Mobile toggle */}
      <button
        className="md:hidden w-11 h-11 flex items-center justify-center"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open
          ? <X size={24} className={textColor} />
          : <Menu size={24} className={textColor} />
        }
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl py-6 flex flex-col items-center gap-5 md:hidden">
          {NAV_KEYS.map(({ href, key }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-deep-blue font-semibold hover:text-terracotta transition-colors text-base"
            >
              {t(key)}
            </a>
          ))}

          {/* Language pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-black/5 w-full px-6">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => { pickLang(code); setOpen(false) }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-bold border transition-colors',
                  lang === code
                    ? 'bg-terracotta text-white border-terracotta'
                    : 'bg-white text-deep-blue border-black/10 hover:border-terracotta hover:text-terracotta'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
