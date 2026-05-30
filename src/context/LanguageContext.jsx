import { createContext, useContext, useState, useEffect } from 'react'

// ─── Country → Language ───────────────────────────────────────────────────────
const COUNTRY_TO_LANG = {
  MA: 'ar', DZ: 'ar', TN: 'ar', EG: 'ar', SA: 'ar', AE: 'ar',
  QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar', JO: 'ar', LB: 'ar',
  LY: 'ar', IQ: 'ar', YE: 'ar', SD: 'ar',
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', CI: 'fr', SN: 'fr',
  CM: 'fr', GA: 'fr', MG: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', CL: 'es',
  VE: 'es', EC: 'es',
  NL: 'nl',
  DE: 'de', AT: 'de',
  IT: 'it',
  PT: 'pt', BR: 'pt',
}

// ─── Country → Currency ───────────────────────────────────────────────────────
const COUNTRY_TO_CURRENCY = {
  MA: 'MAD',
  // Eurozone
  FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', PT: 'EUR',
  BE: 'EUR', AT: 'EUR', LU: 'EUR', FI: 'EUR', IE: 'EUR', GR: 'EUR',
  MC: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR',
  CY: 'EUR', MT: 'EUR',
  // UK / Commonwealth
  GB: 'GBP', US: 'USD', CA: 'CAD', AU: 'AUD', NZ: 'NZD',
  // Europe non-euro
  CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK',
  // Gulf
  AE: 'AED', SA: 'SAR', QA: 'QAR',
  // Rest defaults to EUR (set below via fallback)
}

const SUPPORTED_LANGS = ['en', 'ar', 'fr', 'es', 'nl', 'de', 'it', 'pt']

const RATES_CACHE_KEY = 'azayla-fx'
const RATES_TTL       = 3_600_000   // 1 hour

// ─── Currency formatting helpers ──────────────────────────────────────────────
function buildFormatter(currency) {
  const opts = { maximumFractionDigits: 0, minimumFractionDigits: 0 }
  const map = {
    EUR: n => `${new Intl.NumberFormat('de-DE', opts).format(n)} €`,
    GBP: n => `£${new Intl.NumberFormat('en-GB', opts).format(n)}`,
    USD: n => `$${new Intl.NumberFormat('en-US', opts).format(n)}`,
    CAD: n => `CA$${new Intl.NumberFormat('en-CA', opts).format(n)}`,
    AUD: n => `A$${new Intl.NumberFormat('en-AU', opts).format(n)}`,
    NZD: n => `NZ$${new Intl.NumberFormat('en-NZ', opts).format(n)}`,
    CHF: n => `CHF ${new Intl.NumberFormat('de-CH', opts).format(n)}`,
    SEK: n => `${new Intl.NumberFormat('sv-SE', opts).format(n)} kr`,
    NOK: n => `${new Intl.NumberFormat('nb-NO', opts).format(n)} kr`,
    DKK: n => `${new Intl.NumberFormat('da-DK', opts).format(n)} kr`,
    AED: n => `${new Intl.NumberFormat('ar-AE', opts).format(n)} AED`,
    SAR: n => `${new Intl.NumberFormat('ar-SA', opts).format(n)} SAR`,
    QAR: n => `${new Intl.NumberFormat('ar-QA', opts).format(n)} QAR`,
    MAD: n => `${new Intl.NumberFormat('fr-MA', opts).format(n)} MAD`,
  }
  return map[currency] ?? map.MAD
}

// ─── Context ──────────────────────────────────────────────────────────────────
const LanguageContext = createContext({
  lang:        'en',
  setLang:     () => {},
  currency:    'MAD',
  formatPrice: n  => `${n} MAD`,
  getAmount:   n  => Number(n),
})

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('azayla-lang')
    return SUPPORTED_LANGS.includes(saved) ? saved : 'en'
  })

  const [currency, setCurrency] = useState(() => {
    // Restore last detected currency instantly (prevents flash on repeat visits)
    return localStorage.getItem('azayla-currency') || 'MAD'
  })

  // rates: { EUR: 0.0912, USD: 0.0988, ... } (base = MAD)
  const [rates, setRates] = useState(() => {
    try {
      const raw = localStorage.getItem(RATES_CACHE_KEY)
      if (raw) {
        const { ts, data } = JSON.parse(raw)
        if (Date.now() - ts < RATES_TTL) return data
      }
    } catch {}
    return {}
  })

  // ── Single IP call — sets both language and currency ────────────────
  useEffect(() => {
    const savedLang = localStorage.getItem('azayla-lang')

    fetch('https://ipwho.is/')
      .then(r => r.json())
      .then(({ success, country_code: cc }) => {
        if (!success || !cc) return

        // Language (respect manual choice)
        if (!savedLang) {
          const detected = COUNTRY_TO_LANG[cc] || 'en'
          setLangState(detected)
        }

        // Currency
        const detectedCurrency = COUNTRY_TO_CURRENCY[cc] || 'EUR'
        setCurrency(detectedCurrency)
        localStorage.setItem('azayla-currency', detectedCurrency)

        // Fetch live exchange rates if not MAD
        if (detectedCurrency !== 'MAD') {
          fetchRates(detectedCurrency)
        }
      })
      .catch(() => {
        // Browser language fallback for lang only
        if (!savedLang) {
          const bl = navigator.language?.slice(0, 2)
          if (SUPPORTED_LANGS.includes(bl)) setLangState(bl)
        }
      })
  }, [])

  // ── Fetch exchange rates (CDN-hosted, free, no API key) ─────────────
  async function fetchRates(targetCurrency) {
    // Served fresh if cache is stale or missing the needed currency
    try {
      const raw = localStorage.getItem(RATES_CACHE_KEY)
      if (raw) {
        const { ts, data } = JSON.parse(raw)
        if (Date.now() - ts < RATES_TTL && data[targetCurrency] != null) {
          setRates(data)
          return
        }
      }
    } catch {}

    try {
      // Free CDN exchange rate API — MAD as base, updated daily
      const res  = await fetch(
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/mad.json'
      )
      const json = await res.json()
      if (!json?.mad) throw new Error('invalid response')

      // Normalize to uppercase keys
      const normalized = Object.fromEntries(
        Object.entries(json.mad).map(([k, v]) => [k.toUpperCase(), v])
      )

      setRates(normalized)
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: normalized }))
    } catch {
      // Silent — prices fall back to MAD
    }
  }

  // ── DOM lang/dir ─────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  function setLang(l) {
    localStorage.setItem('azayla-lang', l)
    setLangState(l)
  }

  /**
   * Convert a MAD amount to the detected display currency (integer, no decimals).
   */
  function getAmount(madAmount) {
    if (!madAmount && madAmount !== 0) return 0
    if (currency === 'MAD' || !rates[currency]) return Math.round(Number(madAmount))
    return Math.ceil(Number(madAmount) * rates[currency])
  }

  /**
   * Format a MAD amount as a localized price string in the detected currency.
   * e.g. formatPrice(1200) → "110 €"  (for a French visitor)
   */
  function formatPrice(madAmount) {
    if (madAmount == null) return null
    const fmt = buildFormatter(currency)
    return fmt(getAmount(madAmount))
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, currency, formatPrice, getAmount }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

/** Convenience hook for price formatting */
export function useCurrency() {
  const { currency, formatPrice, getAmount } = useContext(LanguageContext)
  return { currency, formatPrice, getAmount }
}
