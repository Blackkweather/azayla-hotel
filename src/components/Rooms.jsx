import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Users, BedDouble, Check } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useT } from '@/hooks/useT'

const ROOMS = [
  {
    id: 1,
    name: 'Double Room',
    subtitle: 'Private Bathroom',
    badge: 'Private Bath',
    guests: 2,
    beds: 'King bed',
    images: [
      '/images/rooms/chambre-double-prive/whatsapp-image-2026-05-19-at-09.40.53.jpeg',
      '/images/rooms/chambre-double-prive/whatsapp-image-2026-05-19-at-09.40.53-1.jpeg',
      '/images/rooms/chambre-double-prive/whatsapp-image-2026-05-19-at-09.40.53-2.jpeg',
    ],
    amenities: ['Private bathroom', 'Free Wi-Fi', 'Air conditioning', 'Flat-screen TV'],
  },
  {
    id: 2,
    name: 'Double or Twin Room',
    subtitle: 'Garden View',
    badge: 'Garden View',
    guests: 3,
    beds: 'Single + King bed',
    images: [
      '/images/rooms/chambre-double-jumeaux/whatsapp-image-2026-05-19-at-09.46.15.jpeg',
      '/images/rooms/chambre-double-deluxe/whatsapp-image-2026-05-19-at-09.44.12.jpeg',
    ],
    amenities: ['Garden view', 'Free Wi-Fi', 'Air conditioning', 'Private balcony'],
  },
  {
    id: 3,
    name: 'Deluxe Double Room',
    subtitle: 'With Extra Bed',
    badge: 'Deluxe',
    guests: 3,
    beds: 'Single + King bed',
    images: [
      '/images/rooms/chambre-double-deluxe/whatsapp-image-2026-05-19-at-09.44.11.jpeg',
      '/images/rooms/chambre-double-deluxe/whatsapp-image-2026-05-19-at-09.44.12-1.jpeg',
    ],
    amenities: ['City view', 'Free Wi-Fi', 'Air conditioning', 'Private bathroom'],
  },
  {
    id: 4,
    name: 'Family Room',
    subtitle: 'Sleeps up to 4',
    badge: 'Family',
    guests: 4,
    beds: '2 King beds',
    images: [
      '/images/rooms/chambre-quadruple/000.jpeg',
      '/images/rooms/chambre-quadruple/22.jpeg',
    ],
    amenities: ['Spacious layout', 'Free Wi-Fi', 'Air conditioning', 'Private shower'],
  },
  {
    id: 5,
    name: 'Suite with Terrace',
    subtitle: 'Panoramic Atlantic Views',
    badge: 'Suite',
    guests: 2,
    beds: 'King bed',
    images: [
      '/images/rooms/suite-terrasse/whatsapp-image-2026-05-19-at-09.50.35.jpeg',
      '/images/rooms/suite-terrasse/whatsapp-image-2026-05-19-at-09.50.36.jpeg',
      '/images/rooms/suite-terrasse/whatsapp-image-2026-05-19-at-09.50.36-1.jpeg',
      '/images/rooms/suite-terrasse/whatsapp-image-2026-05-19-at-09.50.36-2.jpeg',
      '/images/rooms/suite-terrasse/whatsapp-image-2026-05-19-at-09.50.36-3.jpeg',
    ],
    amenities: ['Private terrace', 'Bedroom & lounge', 'Sofa bed', 'Panoramic view'],
  },
]

function RoomCard({ room }) {
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)
  const total = room.images.length
  const t = useT()

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total])

  useEffect(() => {
    if (hovered || total <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [hovered, next, total])

  return (
    <div
      className="group bg-white flex flex-col shadow-[0_4px_24px_rgba(27,58,75,0.07)] hover:shadow-[0_16px_48px_rgba(27,58,75,0.16)] transition-all duration-500"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-72">
        {room.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${room.name} — view ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-[1] pointer-events-none" />

        <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
          <a
            href="https://www.booking.com/hotel/ma/azayla-asilah.fr.html"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white text-white text-[0.65rem] uppercase tracking-[3px] px-7 py-2.5 hover:bg-white hover:text-deep-blue transition-colors duration-300"
            onClick={e => e.stopPropagation()}
          >
            {t('rooms.bookNow')}
          </a>
        </div>

        <Badge className="absolute top-4 left-4 z-[3]">{room.badge}</Badge>

        {total > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-[3] w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Previous"
            >
              <ChevronLeft size={16} className="text-deep-blue" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-[3] w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Next"
            >
              <ChevronRight size={16} className="text-deep-blue" />
            </button>
          </>
        )}

        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[3] flex gap-1.5">
            {room.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-full transition-all ${
                  i === current ? 'bg-white w-5' : 'bg-white/50 w-1.5'
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="flex flex-col flex-1 p-7">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px w-6 bg-gold" />
          <div className="w-1 h-1 rounded-full bg-gold/70" />
        </div>

        <h3 className="font-cormorant text-[1.5rem] text-deep-blue font-semibold leading-tight">
          {room.name}
        </h3>
        <p className="text-[0.7rem] text-terracotta uppercase tracking-widest mb-4">{room.subtitle}</p>

        <div className="flex gap-5 mb-5 pb-5 border-b border-gray-100">
          <span className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-wide">
            <BedDouble size={14} className="text-terracotta" />
            {room.beds}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-wide">
            <Users size={14} className="text-terracotta" />
            {t('rooms.guests', { n: room.guests })}
          </span>
        </div>

        <ul className="grid grid-cols-2 gap-y-2 gap-x-3 mb-6 overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-500 ease-in-out">
          {room.amenities.map(a => (
            <li key={a} className="flex items-center gap-1.5 text-[0.8rem] text-gray-500">
              <Check size={11} className="text-gold shrink-0" />
              {a}
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Button asChild className="w-full rounded-none tracking-widest text-xs uppercase">
            <a href="https://www.booking.com/hotel/ma/azayla-asilah.fr.html" target="_blank" rel="noopener noreferrer">
              {t('rooms.bookOnline')}
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Rooms() {
  const t = useT()

  return (
    <section id="rooms" className="py-28 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <p className="eyebrow mb-3">{t('rooms.eyebrow')}</p>
        <h2 className="font-cormorant text-[2.8rem] text-deep-blue section-underline">{t('rooms.title')}</h2>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ROOMS.map(room => <RoomCard key={room.id} room={room} />)}
      </div>
    </section>
  )
}
