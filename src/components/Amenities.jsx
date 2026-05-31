import { Check } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { useT } from '@/hooks/useT'

const CATEGORIES = [
  {
    titleKey: 'amenities.cat.accommodation',
    color: 'bg-deep-blue',
    icon: (
      <svg className="w-9 h-9 mb-3" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="32" width="32" height="3" rx="1"/>
        <path d="M10 32V19a10 10 0 0 1 20 0v13"/>
        <line x1="20" y1="9" x2="20" y2="5"/>
        <path d="M16 32v-5h8v5"/>
      </svg>
    ),
    items: ['Air conditioning', 'Private bathrooms', 'Flat-screen TV', 'Daily housekeeping'],
  },
  {
    titleKey: 'amenities.cat.restaurants',
    color: 'bg-terracotta',
    icon: (
      <svg className="w-9 h-9 mb-3" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 6v10c0 3.3 2.7 6 6 6s6-2.7 6-6V6"/>
        <line x1="20" y1="22" x2="20" y2="34"/>
        <line x1="13" y1="34" x2="27" y2="34"/>
        <line x1="14" y1="12" x2="26" y2="12"/>
      </svg>
    ),
    items: [
      'Moroccan cuisine steps away',
      'Fresh seafood restaurants',
      'Mediterranean & Spanish tapas',
      'Rooftop cafés & tea houses',
    ],
  },
  {
    titleKey: 'amenities.cat.services',
    color: 'bg-gold',
    icon: (
      <svg className="w-9 h-9 mb-3" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="20" r="14"/>
        <path d="M20 13v7l5 3"/>
      </svg>
    ),
    items: ['Free high-speed Wi-Fi', '24-hour reception', 'Airport shuttle', 'Concierge service'],
  },
  {
    titleKey: 'amenities.cat.location',
    color: 'bg-[#2d6a4f]',
    icon: (
      <svg className="w-9 h-9 mb-3" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 4C13.4 4 8 9.4 8 16c0 10 12 22 12 22s12-12 12-22c0-6.6-5.4-12-12-12z"/>
        <circle cx="20" cy="16" r="4"/>
      </svg>
    ),
    items: [
      '100m from Plage de Asilah',
      'Heart of the Medina',
      'Steps from Atlantic ramparts',
      '45 min to Tangier Airport',
    ],
  },
]

export default function Amenities() {
  const t = useT()

  return (
    <section id="amenities" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#f9f6f2]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="eyebrow mb-3">{t('amenities.eyebrow')}</p>
          <h2 className="font-cormorant text-[2rem] sm:text-[2.8rem] text-deep-blue section-underline">{t('amenities.title')}</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map(cat => (
            <Card key={cat.titleKey} className="overflow-hidden hover:-translate-y-1 transition-transform duration-300">
              <div className={`${cat.color} text-white p-6 text-center`}>
                {cat.icon}
                <h3 className="font-cormorant text-xl font-semibold">{t(cat.titleKey)}</h3>
                <div className="h-px bg-white/25 mt-3 rounded" />
              </div>

              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {cat.items.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check size={15} className="text-terracotta mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
