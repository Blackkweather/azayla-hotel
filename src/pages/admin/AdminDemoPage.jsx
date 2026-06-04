import { useState } from 'react'
import {
  Edit2, Trash2, Eye, EyeOff, ExternalLink,
  BedDouble, Users, LayoutGrid, CalendarCheck,
  Check, X, Clock, Calendar, Mail, Phone, MessageSquare,
} from 'lucide-react'

const MOCK_ROOMS = [
  {
    id: 1,
    name: 'Suite Royale',
    subtitle: 'Luxury Ocean-View Suite',
    beds: 'King bed',
    guests: 2,
    price_per_night: 1800,
    currency: 'MAD',
    is_available: true,
    display_order: 1,
    description: 'Our most prestigious suite featuring panoramic views of the Atlantic, a private terrace, and bespoke Moroccan furnishings.',
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'],
  },
  {
    id: 2,
    name: 'Chambre Deluxe',
    subtitle: 'Deluxe Double Room',
    beds: 'Queen bed',
    guests: 2,
    price_per_night: 1100,
    currency: 'MAD',
    is_available: true,
    display_order: 2,
    description: 'Elegantly appointed room with traditional zellige tilework, premium linens, and a private ensuite bathroom.',
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'],
  },
  {
    id: 3,
    name: 'Suite Junior',
    subtitle: 'Junior Suite with Terrace',
    beds: 'King bed',
    guests: 3,
    price_per_night: 1450,
    currency: 'MAD',
    is_available: true,
    display_order: 3,
    description: 'Spacious junior suite with a private terrace overlooking the medina and sea, featuring a separate seating area.',
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
  },
  {
    id: 4,
    name: 'Chambre Supérieure',
    subtitle: 'Superior Twin Room',
    beds: '2 single beds',
    guests: 2,
    price_per_night: 950,
    currency: 'MAD',
    is_available: true,
    display_order: 4,
    description: 'Bright and comfortable twin room ideal for friends or colleagues, with classic Moroccan décor.',
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'],
  },
  {
    id: 5,
    name: 'Chambre Standard',
    subtitle: 'Cozy Standard Room',
    beds: 'Double bed',
    guests: 2,
    price_per_night: 750,
    currency: 'MAD',
    is_available: false,
    display_order: 5,
    description: 'Charming standard room with authentic Moroccan touches and all essential amenities.',
    images: ['https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80'],
  },
  {
    id: 6,
    name: 'Suite Familiale',
    subtitle: 'Family Suite',
    beds: '1 King + 2 singles',
    guests: 4,
    price_per_night: 2100,
    currency: 'MAD',
    is_available: true,
    display_order: 6,
    description: 'Generous family suite with interconnected rooms, perfect for families exploring the beauty of Asilah.',
    images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'],
  },
]

const MOCK_BOOKINGS = [
  {
    id: 'b1',
    booking_ref: 'AZL-2847',
    guest_name: 'Sophie Martin',
    guest_email: 'sophie.martin@gmail.com',
    guest_phone: '+33 6 12 34 56 78',
    room_name: 'Suite Royale',
    check_in: '2026-06-10',
    check_out: '2026-06-14',
    guests: 2,
    total_price: 7200,
    currency: 'MAD',
    status: 'confirmed',
    special_requests: 'Late check-in requested (after 22:00). Champagne in room for anniversary.',
    created_at: '2026-05-20T10:14:00Z',
  },
  {
    id: 'b2',
    booking_ref: 'AZL-2848',
    guest_name: 'James Okafor',
    guest_email: 'j.okafor@outlook.com',
    guest_phone: '+44 7700 900123',
    room_name: 'Chambre Deluxe',
    check_in: '2026-06-12',
    check_out: '2026-06-15',
    guests: 2,
    total_price: 3300,
    currency: 'MAD',
    status: 'pending',
    special_requests: '',
    created_at: '2026-05-28T08:45:00Z',
  },
  {
    id: 'b3',
    booking_ref: 'AZL-2849',
    guest_name: 'Amina Benali',
    guest_email: 'amina.benali@hotmail.com',
    guest_phone: '+212 661 234 567',
    room_name: 'Suite Familiale',
    check_in: '2026-06-20',
    check_out: '2026-06-27',
    guests: 4,
    total_price: 14700,
    currency: 'MAD',
    status: 'pending',
    special_requests: 'Baby cot needed. Prefer a room away from the street.',
    created_at: '2026-05-30T14:22:00Z',
  },
  {
    id: 'b4',
    booking_ref: 'AZL-2845',
    guest_name: 'Carlos Ruiz',
    guest_email: 'c.ruiz@empresa.es',
    guest_phone: '+34 612 345 678',
    room_name: 'Suite Junior',
    check_in: '2026-05-28',
    check_out: '2026-05-31',
    guests: 2,
    total_price: 4350,
    currency: 'MAD',
    status: 'confirmed',
    special_requests: '',
    created_at: '2026-05-10T09:00:00Z',
  },
  {
    id: 'b5',
    booking_ref: 'AZL-2841',
    guest_name: 'Emma Dupont',
    guest_email: 'emma.dupont@free.fr',
    guest_phone: '+33 7 98 76 54 32',
    room_name: 'Chambre Standard',
    check_in: '2026-05-15',
    check_out: '2026-05-17',
    guests: 1,
    total_price: 1500,
    currency: 'MAD',
    status: 'cancelled',
    special_requests: '',
    created_at: '2026-05-01T16:30:00Z',
  },
]

const STATUS_CFG = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500 border-gray-200' },
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtPrice(n, currency) {
  if (!n) return '—'
  return new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(n) + ' ' + (currency || 'MAD')
}

function nights(ci, co) {
  if (!ci || !co) return 0
  return Math.max(0, Math.round((new Date(co) - new Date(ci)) / 86400000))
}

function BookingsDemo() {
  const [filter, setFilter]   = useState('all')
  const [expanded, setExpanded] = useState(null)

  const filtered = filter === 'all' ? MOCK_BOOKINGS : MOCK_BOOKINGS.filter(b => b.status === filter)
  const counts = {
    all:       MOCK_BOOKINGS.length,
    pending:   MOCK_BOOKINGS.filter(b => b.status === 'pending').length,
    confirmed: MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length,
    cancelled: MOCK_BOOKINGS.filter(b => b.status === 'cancelled').length,
  }

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all','pending','confirmed','cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors border ${
              filter === s
                ? 'bg-deep-blue text-white border-deep-blue'
                : 'bg-white text-gray-500 border-gray-200 hover:border-deep-blue/30'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[0.6rem] font-bold ${
              filter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(b => {
          const cfg = STATUS_CFG[b.status] ?? STATUS_CFG.pending
          const n = nights(b.check_in, b.check_out)
          const isOpen = expanded === b.id

          return (
            <div
              key={b.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                b.status === 'cancelled' ? 'opacity-60' : 'border-gray-100'
              }`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : b.id)}
                className="w-full text-left px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-deep-blue text-sm">{b.guest_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="font-mono text-[0.65rem] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">{b.booking_ref}</span>
                    </div>
                    <p className="text-xs text-terracotta/80 font-medium truncate">{b.room_name}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {fmtDate(b.check_in)} → {fmtDate(b.check_out)}
                      </span>
                      <span>{n} night{n !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {b.guests}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-deep-blue text-sm">{fmtPrice(b.total_price, b.currency)}</p>
                    <p className="text-[0.65rem] text-gray-400 mt-1">
                      {new Date(b.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-50">
                  <div className="grid sm:grid-cols-2 gap-4 py-4 text-sm">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-gray-600">
                        <Mail size={13} className="text-gray-400" />
                        {b.guest_email}
                      </p>
                      {b.guest_phone && (
                        <p className="flex items-center gap-2 text-gray-600">
                          <Phone size={13} className="text-gray-400" />
                          {b.guest_phone}
                        </p>
                      )}
                    </div>
                    {b.special_requests && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <MessageSquare size={13} className="text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-xs leading-relaxed">{b.special_requests}</p>
                      </div>
                    )}
                  </div>

                  {b.status !== 'cancelled' && (
                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      {b.status === 'pending' && (
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition-colors">
                          <Check size={13} /> Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <span className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold">
                          <Check size={13} /> Confirmed
                        </span>
                      )}
                      <button className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1">
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminDemoPage() {
  const [activeTab, setActiveTab] = useState('rooms')
  const pendingCount = MOCK_BOOKINGS.filter(b => b.status === 'pending').length
  const availableCount = MOCK_ROOMS.filter(r => r.is_available).length

  return (
    <div className="min-h-screen bg-[#f7f6f3] pb-24 sm:pb-0">

      {/* Top bar */}
      <header className="bg-deep-blue shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo-removebg-preview.png" alt="Azayla" className="h-10 sm:h-14 w-auto brightness-0 invert shrink-0" />
            <div className="border-l border-white/10 pl-3 min-w-0">
              <p className="font-cormorant text-white text-base sm:text-lg font-semibold leading-none">Dashboard</p>
              <p className="text-white/40 text-[0.65rem] mt-0.5 truncate hidden sm:block">admin@azayla.hotel</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/50 hover:text-white/90 text-xs transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">View site</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
              activeTab === 'rooms'
                ? 'bg-deep-blue text-white border-deep-blue shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-deep-blue/30'
            }`}
          >
            <LayoutGrid size={15} /> Rooms
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
              activeTab === 'bookings'
                ? 'bg-deep-blue text-white border-deep-blue shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-deep-blue/30'
            }`}
          >
            <CalendarCheck size={15} /> Reservations
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-terracotta text-white rounded-full text-[0.6rem] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'bookings' && <BookingsDemo />}

        {activeTab === 'rooms' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                { label: 'Total Rooms', value: MOCK_ROOMS.length,                    color: 'text-deep-blue' },
                { label: 'Live',        value: availableCount,                        color: 'text-emerald-600' },
                { label: 'Hidden',      value: MOCK_ROOMS.length - availableCount,   color: 'text-terracotta' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-7 py-4 sm:py-5">
                  <p className="text-[0.6rem] sm:text-xs text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`font-cormorant text-4xl sm:text-5xl font-bold ${s.color} leading-none`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-cormorant text-xl sm:text-2xl font-bold text-deep-blue flex items-center gap-2">
                  <LayoutGrid size={18} className="text-terracotta" />
                  Room Catalog
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Tap a card to edit · changes go live instantly</p>
              </div>
              <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                + Add Room
              </button>
            </div>

            {/* Room grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {MOCK_ROOMS.map(room => (
                <div
                  key={room.id}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-200 ${
                    room.is_available ? 'border-gray-100 hover:shadow-md' : 'border-dashed border-gray-200 opacity-60'
                  }`}
                >
                  {/* Cover */}
                  <div className="relative h-44 sm:h-48 bg-gray-100 group">
                    <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wide ${
                      room.is_available ? 'bg-emerald-500 text-white' : 'bg-gray-800/70 text-gray-300'
                    }`}>
                      {room.is_available ? 'Live' : 'Hidden'}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-black/50 text-white text-[0.65rem] px-2 py-1 rounded-full">
                      {room.images.length} photo{room.images.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-cormorant text-[1.1rem] font-semibold text-deep-blue leading-tight">
                        {room.name}
                      </h3>
                      <span className="text-sm font-bold text-terracotta whitespace-nowrap shrink-0">
                        {Number(room.price_per_night).toLocaleString('fr-MA')} {room.currency}
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-terracotta/80 uppercase tracking-wider mb-2">{room.subtitle}</p>
                    <div className="flex gap-4 mb-3">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <BedDouble size={11} className="text-gray-300" /> {room.beds}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users size={11} className="text-gray-300" /> {room.guests} guests
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4">{room.description}</p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 rounded-xl bg-deep-blue/5 hover:bg-deep-blue/10 text-deep-blue text-xs font-semibold transition-colors">
                        <Edit2 size={13} /> Edit
                      </button>
                      <button className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition-colors ${
                        room.is_available
                          ? 'bg-orange-50 hover:bg-orange-100 text-orange-600'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                      }`}>
                        {room.is_available ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </main>
    </div>
  )
}
