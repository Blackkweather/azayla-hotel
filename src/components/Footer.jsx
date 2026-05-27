import { MapPin, Phone, Mail } from 'lucide-react'

const EXPLORE = [
  { href: '#about', label: 'About Us' },
  { href: '#rooms', label: 'Our Rooms' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#amenities', label: 'Amenities' },
  { href: '#reviews', label: 'Guest Reviews' },
  { href: '#location', label: 'Location' },
]

const CONTACT = [
  { icon: <MapPin size={14} className="text-gold mt-0.5 shrink-0" />, text: 'Avenue Moulay Ismail, Asilah 90050, Morocco' },
  { icon: <Phone size={14} className="text-gold mt-0.5 shrink-0" />, text: '+212 539-416717' },
  { icon: <Mail size={14} className="text-gold mt-0.5 shrink-0" />, text: 'azayla.hotel@gmail.com' },
]

export default function Footer() {
  return (
    <footer className="bg-deep-blue text-white/70 pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 pb-12 border-b border-white/10">

          {/* Brand */}
          <div>
            <a href="#hero" className="inline-block mb-3">
              <img src="/logo-removebg-preview.png" alt="Azayla Hotel" className="h-[100px] w-auto object-contain brightness-0 invert" />
            </a>
            <p className="text-sm leading-relaxed text-white/55 max-w-[260px]">
              A boutique riad in the heart of Asilah's whitewashed medina, where Moroccan soul meets Atlantic charm.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-cormorant text-lg font-semibold text-white mb-5">Explore</h4>
            <ul className="space-y-2.5">
              {EXPLORE.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/55 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-cormorant text-lg font-semibold text-white mb-5">Contact</h4>
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
          <span>&copy; 2026 Azayla Hotel. All rights reserved.</span>
          <span>Asilah, Morocco · Boutique Riad Experience</span>
        </div>
      </div>
    </footer>
  )
}
