import { MapPin, Clock, Phone } from 'lucide-react'
import { Card } from './ui/card'

const INFO = [
  {
    icon: <MapPin size={18} className="text-terracotta shrink-0 mt-0.5" />,
    text: 'Avenue Moulay Ismail, Asilah 90050, Morocco',
  },
  {
    icon: <Clock size={18} className="text-terracotta shrink-0 mt-0.5" />,
    text: 'Check-in: 14:00  ·  Check-out: 11:00',
  },
  {
    icon: <Phone size={18} className="text-terracotta shrink-0 mt-0.5" />,
    text: '+212 539-416717',
  },
]

export default function Location() {
  return (
    <section id="location" className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-14 section-underline">
        <h2 className="font-cormorant text-[2.8rem] text-deep-blue">Location</h2>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] mb-8">
        <iframe
          src="https://maps.google.com/maps?q=Azayla+Hotel+Asilah+Morocco&t=&z=17&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="420"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="Azayla Hotel location"
        />
      </div>

      <Card className="max-w-xl mx-auto p-6">
        <ul className="space-y-4">
          {INFO.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[0.95rem] text-deep-blue">
              {item.icon}
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  )
}
