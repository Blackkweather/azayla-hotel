import { createContext, useContext, useState, useEffect } from 'react'

const COUNTRY_TO_LANG = {
  MA: 'ar', DZ: 'ar', TN: 'ar', EG: 'ar', SA: 'ar', AE: 'ar',
  QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar', JO: 'ar', LB: 'ar', LY: 'ar', IQ: 'ar', YE: 'ar', SD: 'ar',
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', CI: 'fr', SN: 'fr', CM: 'fr', GA: 'fr', MG: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', CL: 'es', VE: 'es', EC: 'es',
  NL: 'nl',
  DE: 'de', AT: 'de',
  IT: 'it',
  PT: 'pt', BR: 'pt',
}

const SUPPORTED = ['en', 'ar', 'fr', 'es', 'nl', 'de', 'it', 'pt']

const LanguageContext = createContext({ lang: 'en', setLang: () => {} })

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('azayla-lang')
    return SUPPORTED.includes(saved) ? saved : 'en'
  })

  useEffect(() => {
    if (localStorage.getItem('azayla-lang')) return
    fetch('https://ipwho.is/')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.country_code) {
          setLangState(COUNTRY_TO_LANG[data.country_code] || 'en')
        }
      })
      .catch(() => {
        const browserLang = navigator.language?.slice(0, 2)
        if (SUPPORTED.includes(browserLang)) setLangState(browserLang)
      })
  }, [])

  function setLang(l) {
    localStorage.setItem('azayla-lang', l)
    setLangState(l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
