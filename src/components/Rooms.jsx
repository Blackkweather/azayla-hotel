import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Users, BedDouble, Check } from 'lucide-react'
import { Card, CardContent, CardFooter } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

const ROOMS = [
  {
    id: 1,
    name: 'Chambre Double avec Salle de Bains Privative',
    badge: 'Private Bath',
    guests: 2,
    beds: '1 grand lit double',
    images: [
      '/images/rooms/chambre-double-prive/whatsapp-image-2026-05-19-at-09.40.53.jpeg',
      '/images/rooms/chambre-double-prive/whatsapp-image-2026-05-19-at-09.40.53-1.jpeg',
      '/images/rooms/chambre-double-prive/whatsapp-image-2026-05-19-at-09.40.53-2.jpeg',
    ],
    amenities: ['Salle de bain privative', 'Wi-Fi gratuit', 'Climatisation', 'Flat-Screen TV'],
  },
  {
    id: 2,
    name: 'Chambre Double ou Lits Jumeaux — Vue sur Jardin',
    badge: 'Garden View',
    guests: 3,
    beds: '1 simple + 1 grand double',
    images: [
      '/images/rooms/chambre-double-jumeaux/whatsapp-image-2026-05-19-at-09.46.15.jpeg',
      '/images/rooms/chambre-double-jumeaux/whatsapp-image-2026-05-19-at-09.46.16.jpeg',
    ],
    amenities: ['Vue sur le jardin', 'Wi-Fi gratuit', 'Climatisation', 'Balcon privé'],
  },
  {
    id: 3,
    name: "Chambre Double Deluxe avec Lit d'Appoint",
    badge: 'Deluxe',
    guests: 3,
    beds: '1 simple + 1 grand double',
    images: [
      '/images/rooms/chambre-double-deluxe/whatsapp-image-2026-05-19-at-09.44.11.jpeg',
      '/images/rooms/chambre-double-deluxe/whatsapp-image-2026-05-19-at-09.44.12.jpeg',
      '/images/rooms/chambre-double-deluxe/whatsapp-image-2026-05-19-at-09.44.12-1.jpeg',
    ],
    amenities: ['Vue sur la ville', 'Wi-Fi gratuit', 'Climatisation', 'Salle de bain privée'],
  },
  {
    id: 4,
    name: 'Chambre Quadruple avec Salle de Bains Privative',
    badge: 'Family Room',
    guests: 4,
    beds: '2 grands lits doubles',
    images: [
      '/images/rooms/chambre-quadruple/000.jpeg',
      '/images/rooms/chambre-quadruple/22.jpeg',
    ],
    amenities: ['Spacieuse', 'Wi-Fi gratuit', 'Climatisation', 'Douche privée'],
  },
  {
    id: 5,
    name: 'Suite avec Terrasse',
    badge: 'Suite',
    guests: 2,
    beds: '1 grand lit double',
    images: [
      '/images/rooms/suite-terrasse/whatsapp-image-2026-05-19-at-09.50.35.jpeg',
      '/images/rooms/suite-terrasse/whatsapp-image-2026-05-19-at-09.50.36.jpeg',
      '/images/rooms/suite-terrasse/whatsapp-image-2026-05-19-at-09.50.36-1.jpeg',
      '/images/rooms/suite-terrasse/whatsapp-image-2026-05-19-at-09.50.36-2.jpeg',
      '/images/rooms/suite-terrasse/whatsapp-image-2026-05-19-at-09.50.36-3.jpeg',
    ],
    amenities: ['Terrasse privée', 'Chambre & salon', 'Canapé-lit', 'Vue panoramique'],
  },
]

function RoomCard({ room }) {
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)
  const total = room.images.length

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total])

  useEffect(() => {
    if (hovered || total <= 1) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [hovered, next, total])

  return (
    <Card
      className="overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(27,58,75,0.15)] transition-all duration-400"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image carousel */}
      <div className="relative h-64 overflow-hidden">
        {room.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${room.name} — view ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              i === current ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`}
            loading="lazy"
          />
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-[2] pointer-events-none" />

        {/* Badges */}
        <Badge className="absolute top-4 left-4 z-[4]">{room.badge}</Badge>
        <Badge variant="secondary" className="absolute top-4 right-4 z-[4] flex items-center gap-1.5">
          <Users size={12} />
          {room.guests} guests
        </Badge>

        {/* Arrows */}
        {total > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-[4] w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} className="text-deep-blue" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-[4] w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={18} className="text-deep-blue" />
            </button>
          </>
        )}

        {/* Dots */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[4] flex gap-1.5">
            {room.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'bg-white w-5' : 'bg-white/50 w-1.5'
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <CardContent className="pt-5 pb-3">
        <h3 className="font-cormorant text-[1.4rem] text-deep-blue font-semibold mb-3 leading-snug">
          {room.name}
        </h3>

        <div className="flex gap-4 pb-3 mb-3 border-b border-gray-100">
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <BedDouble size={16} className="text-terracotta" />
            {room.beds}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users size={16} className="text-terracotta" />
            {room.guests} guests
          </span>
        </div>

        <ul className="grid grid-cols-2 gap-1.5">
          {room.amenities.map(a => (
            <li key={a} className="flex items-center gap-1.5 text-sm text-gray-600">
              <Check size={13} className="text-gold shrink-0" />
              {a}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />
        <Button asChild className="w-full rounded-xl">
          <a
            href="https://www.booking.com/hotel/ma/azayla-asilah.fr.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book This Room
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function Rooms() {
  return (
    <section id="rooms" className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16 section-underline">
        <h2 className="font-cormorant text-[2.8rem] text-deep-blue">Our Rooms</h2>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {ROOMS.map(room => <RoomCard key={room.id} room={room} />)}
      </div>
    </section>
  )
}
