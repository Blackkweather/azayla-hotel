import { useState, useEffect } from 'react'

const COUNTRY_TO_LANG = {
  // Arabic-speaking
  MA: 'ar', DZ: 'ar', TN: 'ar', EG: 'ar', SA: 'ar', AE: 'ar',
  QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar', JO: 'ar', LB: 'ar', LY: 'ar', IQ: 'ar', YE: 'ar', SD: 'ar',
  // French-speaking
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', CI: 'fr', SN: 'fr', CM: 'fr', GA: 'fr', MG: 'fr',
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', CL: 'es', VE: 'es', EC: 'es',
  // Dutch
  NL: 'nl',
  // German
  DE: 'de', AT: 'de',
  // Italian
  IT: 'it',
  // Portuguese
  PT: 'pt', BR: 'pt',
}

export function useUserLanguage() {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    fetch('https://ipwho.is/')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.country_code) {
          setLang(COUNTRY_TO_LANG[data.country_code] || 'en')
        }
      })
      .catch(() => {
        // fall back to browser language
        const browserLang = navigator.language?.slice(0, 2)
        const supported = ['ar', 'fr', 'es', 'nl', 'de', 'it', 'pt']
        if (supported.includes(browserLang)) setLang(browserLang)
      })
  }, [])

  return lang
}
