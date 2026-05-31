import { MapPin, Phone, Mail } from 'lucide-react'
import { useT } from '@/hooks/useT'

export default function Footer() {
  const t = useT()

  const EXPLORE = [
    { href: '#about',     key: 'footer.link.about' },
    { href: '#rooms',     key: 'footer.link.rooms' },
    { href: '#gallery',   key: 'footer.link.gallery' },
    { href: '#amenities', key: 'footer.link.amenities' },
    { href: '#reviews',   key: 'footer.link.reviews' },
    { href: '#location',  key: 'footer.link.location' },
  ]

  const CONTACT = [
    { icon: <MapPin size={14} className="text-gold mt-0.5 shrink-0" />, text: '20 Rue Ibn Rochd, Asilah 90050, Maroc' },
    { icon: <Phone size={14} className="text-gold mt-0.5 shrink-0" />, text: '+212 539-416717' },
    { icon: <Mail size={14} className="text-gold mt-0.5 shrink-0" />, text: 'azayla.hotel@gmail.com' },
  ]

  return (
    <footer className="bg-deep-blue text-white/70 pt-12 sm:pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 pb-10 sm:pb-12 border-b border-white/10">

          {/* Brand */}
          <div>
            <a href="#hero" className="inline-block mb-3">
              <img src="/logo-removebg-preview.png" alt="Azayla Hotel" className="h-16 sm:h-24 w-auto object-contain brightness-0 invert" />
            </a>
            <p className="text-sm leading-relaxed text-white/55 max-w-[260px]">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-cormorant text-lg font-semibold text-white mb-5">{t('footer.explore')}</h4>
            <ul className="space-y-2.5">
              {EXPLORE.map(link => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/55 hover:text-gold transition-colors">
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-cormorant text-lg font-semibold text-white mb-5">{t('footer.contact')}</h4>
            <ul className="space-y-3">
              {CONTACT.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/55 leading-relaxed">
                  {item.icon}
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center pt-6 text-xs text-white/35 gap-2">
          <span>&copy; 2026 Azayla Hotel. {t('footer.rights')}</span>
          <span>Asilah, Morocco · {t('footer.boutique')}</span>
        </div>
      </div>
    </footer>
  )
}
