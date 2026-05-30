import { useLanguage } from '@/context/LanguageContext'
import { translations } from '@/i18n/translations'

export function useT() {
  const { lang } = useLanguage()
  return (key, vars) => {
    const str = translations[lang]?.[key] ?? translations.en[key] ?? key
    if (!vars) return str
    return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str)
  }
}
