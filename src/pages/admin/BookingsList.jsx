import { useState, useEffect } from 'react'
import { Check, X, Clock, Calendar, Users, Mail, Phone, MessageSquare, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

export default function BookingsList() {
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [updatingId, setUpdatingId] = useState(null)
  const [expanded, setExpanded]   = useState(null)

  async function fetchBookings() {
    const { data } = await supabase
      .from('hotel_bookings')
      .select('*')
      .order('created_at', { ascending: false })
    setBookings(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchBookings() }, [])

  async function setStatus(id, status) {
    setUpdatingId(id)
    const { data } = await supabase
      .from('hotel_bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (data) setBookings(prev => prev.map(b => b.id === id ? data : b))
    setUpdatingId(null)
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)
  const counts = {
    all:       bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  return (
    <div>
      {/* Filter tabs */}
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

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-300">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Clock size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-base mb-1">No {filter === 'all' ? '' : filter} reservations</p>
          <p className="text-sm">They'll appear here as guests book.</p>
        </div>
      ) : (
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
                {/* Summary row — always visible */}
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

                {/* Expanded details */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-50">
                    <div className="grid sm:grid-cols-2 gap-4 py-4 text-sm">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-gray-600">
                          <Mail size={13} className="text-gray-400" />
                          <a href={`mailto:${b.guest_email}`} className="hover:text-terracotta transition-colors">{b.guest_email}</a>
                        </p>
                        {b.guest_phone && (
                          <p className="flex items-center gap-2 text-gray-600">
                            <Phone size={13} className="text-gray-400" />
                            <a href={`tel:${b.guest_phone}`} className="hover:text-terracotta transition-colors">{b.guest_phone}</a>
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

                    {/* Action buttons */}
                    {b.status !== 'cancelled' && (
                      <div className="flex gap-2 pt-3 border-t border-gray-50">
                        {b.status === 'pending' && (
                          <button
                            onClick={() => setStatus(b.id, 'confirmed')}
                            disabled={updatingId === b.id}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
                          >
                            {updatingId === b.id
                              ? <Loader2 size={13} className="animate-spin" />
                              : <Check size={13} />
                            }
                            Confirm
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <span className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold">
                            <Check size={13} /> Confirmed
                          </span>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm('Cancel this reservation?')) setStatus(b.id, 'cancelled')
                          }}
                          disabled={updatingId === b.id}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 flex items-center gap-1"
                        >
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
      )}
    </div>
  )
}
