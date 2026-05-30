import { useLanguage } from '@/context/LanguageContext'

export function useUserLanguage() {
  return useLanguage().lang
}
