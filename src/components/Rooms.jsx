import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Users, BedDouble, Check } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useT } from '@/hooks/useT'
import { useCurrency } from '@/context/LanguageContext'
import { supabase } from '@/lib/supabase'
import BookingModal from './BookingModal'

// ── Skeleton card shown while loading ────────────────────────────────
function RoomSkeleton() {
  return (
    <div className="bg-white shadow-[0_4px_24px_rgba(27,58,75,0.07)] animate-pulse">
      <div className="h-72 bg-gray-200" />
      <div className="p-7 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-10 bg-gray-200 rounded mt-4" />
      </div>
    </div>
  )
}

// ── Single room card ──────────────────────────────────────────────────
function RoomCard({ room, onBook }) {
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)
  const t = useT()
  const { formatPrice } = useCurrency()
  const total = room.images?.length ?? 0

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total])

  useEffect(() => {
    if (hovered || total <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [hovered, next, total])

  const formattedPrice = formatPrice(room.price_per_night)

  return (
    <div
      className="group bg-white flex flex-col shadow-[0_4px_24px_rgba(27,58,75,0.07)] hover:shadow-[0_16px_48px_rgba(27,58,75,0.16)] transition-all duration-500"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Images ── */}
      <div className="relative overflow-hidden h-72">
        {room.images?.map((src, i) => (
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

        {/* Price pill overlay */}
        {formattedPrice && (
          <div className="absolute bottom-4 right-4 z-[3] bg-deep-blue/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide">
            {formattedPrice}<span className="text-white/60 font-normal"> / night</span>
          </div>
        )}

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

      {/* ── Info panel ── */}
      <div className="flex flex-col flex-1 p-7">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px w-6 bg-gold" />
          <div className="w-1 h-1 rounded-full bg-gold/70" />
        </div>

        <h3 className="font-cormorant text-[1.5rem] text-deep-blue font-semibold leading-tight">
          {room.name}
        </h3>
        <p className="text-[0.7rem] text-terracotta uppercase tracking-widest mb-4">{room.subtitle}</p>

        <div className="flex gap-5 mb-4 pb-4 border-b border-gray-100">
          <span className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-wide">
            <BedDouble size={14} className="text-terracotta" />
            {room.beds}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-wide">
            <Users size={14} className="text-terracotta" />
            {t('rooms.guests', { n: room.guests })}
          </span>
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
            {room.description}
          </p>
        )}

        {/* Amenities (visible on hover) */}
        <ul className="grid grid-cols-2 gap-y-2 gap-x-3 mb-5 overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-500 ease-in-out">
          {room.amenities?.map(a => (
            <li key={a} className="flex items-center gap-1.5 text-[0.8rem] text-gray-500">
              <Check size={11} className="text-gold shrink-0" />
              {a}
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Button
            className="w-full rounded-none tracking-widest text-xs uppercase"
            onClick={onBook}
          >
            {t('rooms.reserve')}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────
export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookingRoom, setBookingRoom] = useState(null)
  const t = useT()

  useEffect(() => {
    supabase
      .from('rooms')
      .select('*')
      .order('display_order')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setRooms(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <section id="rooms" className="py-16 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12 sm:mb-16">
        <p className="eyebrow mb-3">{t('rooms.eyebrow')}</p>
        <h2 className="font-cormorant text-[2rem] sm:text-[2.8rem] text-deep-blue section-underline">{t('rooms.title')}</h2>
      </div>

      {error && (
        <p className="text-center text-terracotta text-sm mb-8">Could not load rooms. Please refresh.</p>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <RoomSkeleton key={i} />)
          : rooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={() => setBookingRoom(room)}
              />
            ))
        }
      </div>

      {bookingRoom && (
        <BookingModal
          room={bookingRoom}
          onClose={() => setBookingRoom(null)}
        />
      )}
    </section>
  )
}
