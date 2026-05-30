import { useState, useEffect } from 'react'
import { X, Calendar, Users, ChevronRight, Check, Loader2, AlertCircle, Phone, Mail, User, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useT } from '@/hooks/useT'

const today = new Date().toISOString().split('T')[0]

function nights(ci, co) {
  if (!ci || !co) return 0
  return Math.max(0, Math.round((new Date(co) - new Date(ci)) / 86400000))
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtPrice(n, currency) {
  return new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(n) + ' ' + (currency || 'MAD')
}

// ── Step indicator ────────────────────────────────────────────────────
function Steps({ step }) {
  const labels = ['Dates', 'Details', 'Confirmed']
  return (
    <div className="flex items-center gap-0 justify-center mb-6">
      {labels.map((label, i) => {
        const n = i + 1
        const active = step === n
        const done = step > n
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? 'bg-emerald-500 text-white' :
                active ? 'bg-terracotta text-white shadow-sm' :
                'bg-gray-100 text-gray-400'
              }`}>
                {done ? <Check size={14} /> : n}
              </div>
              <span className={`text-[0.6rem] mt-1 font-medium uppercase tracking-wide ${active ? 'text-terracotta' : done ? 'text-emerald-500' : 'text-gray-300'}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`w-12 h-px mx-1 mb-4 transition-colors ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────
export default function BookingModal({ room, onClose }) {
  const t = useT()

  // Step 1 state
  const [checkIn,  setCheckIn]  = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState(null) // null | true | false

  // Step 2 state
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [requests, setRequests] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Step 3 state
  const [confirmed, setConfirmed] = useState(null) // booking record

  const [step, setStep] = useState(1)

  const n    = nights(checkIn, checkOut)
  const total = n > 0 && room.price_per_night ? n * Number(room.price_per_night) : null

  // Clamp checkout min to day after checkin
  const minCheckOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : today

  useEffect(() => {
    if (checkOut && checkOut <= checkIn) setCheckOut('')
    setAvailable(null)
  }, [checkIn])

  useEffect(() => { setAvailable(null) }, [checkOut])

  // ── Availability check ──────────────────────────────────────────────
  async function checkAvailability() {
    if (!checkIn || !checkOut || n <= 0) return
    setChecking(true)
    setAvailable(null)

    const { count, error: qErr } = await supabase
      .from('hotel_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', room.id)
      .neq('status', 'cancelled')
      .lt('check_in', checkOut)
      .gt('check_out', checkIn)

    setChecking(false)
    if (qErr) { setAvailable(false); return }

    if (count === 0) {
      setAvailable(true)
      setTimeout(() => setStep(2), 350)
    } else {
      setAvailable(false)
    }
  }

  // ── Submit booking ──────────────────────────────────────────────────
  async function submitBooking(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data, error: insertErr } = await supabase
      .from('hotel_bookings')
      .insert({
        room_id:          room.id,
        room_name:        room.name,
        guest_name:       name.trim(),
        guest_email:      email.trim().toLowerCase(),
        guest_phone:      phone.trim() || null,
        check_in:         checkIn,
        check_out:        checkOut,
        guests:           Number(guestCount),
        total_price:      total,
        currency:         room.currency || 'MAD',
        status:           'pending',
        special_requests: requests.trim() || null,
      })
      .select()
      .single()

    setSubmitting(false)

    if (insertErr) {
      setError('Something went wrong. Please try again.')
    } else {
      setConfirmed(data)
      setStep(3)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet — slides up from bottom on mobile, centered on desktop */}
      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Drag handle (mobile) */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-6 pt-4 pb-0 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            {room.images?.[0] && (
              <img src={room.images[0]} alt={room.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-sm" />
            )}
            <div className="min-w-0">
              <p className="font-cormorant text-[1.2rem] font-semibold text-deep-blue leading-tight truncate">{room.name}</p>
              <p className="text-xs text-terracotta/80 uppercase tracking-wider">{room.subtitle}</p>
              {room.price_per_night && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {fmtPrice(room.price_per_night, room.currency)} <span className="text-gray-400">/ night</span>
                </p>
              )}
            </div>
          </div>
          <Steps step={step} />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6">

          {/* ══ STEP 1: Dates ══════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Check-in */}
              <div>
                <label className="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <Calendar size={11} className="inline mr-1 -mt-0.5" />Check-in
                </label>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors bg-white"
                />
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <Calendar size={11} className="inline mr-1 -mt-0.5" />Check-out
                </label>
                <input
                  type="date"
                  min={minCheckOut}
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  disabled={!checkIn}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-300"
                />
              </div>

              {/* Guests */}
              <div>
                <label className="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <Users size={11} className="inline mr-1 -mt-0.5" />Guests
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuestCount(g => Math.max(1, g - 1))}
                    className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-terracotta hover:text-terracotta transition-colors text-lg font-bold"
                  >−</button>
                  <span className="flex-1 text-center font-semibold text-deep-blue text-lg">{guestCount}</span>
                  <button
                    type="button"
                    onClick={() => setGuestCount(g => Math.min(room.guests || 4, g + 1))}
                    className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-terracotta hover:text-terracotta transition-colors text-lg font-bold"
                  >+</button>
                </div>
                <p className="text-xs text-gray-400 mt-1 text-center">Max {room.guests || 4} guests</p>
              </div>

              {/* Price summary */}
              {n > 0 && total && (
                <div className="bg-[#f9f6f2] rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{fmtPrice(room.price_per_night, room.currency)} × {n} night{n !== 1 ? 's' : ''}</span>
                    <span>{fmtPrice(total, room.currency)}</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between font-semibold text-deep-blue">
                    <span>Total</span>
                    <span className="text-terracotta">{fmtPrice(total, room.currency)}</span>
                  </div>
                </div>
              )}

              {/* Availability result */}
              {available === false && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>This room is not available for the selected dates. Please try different dates.</span>
                </div>
              )}

              {available === true && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                  <Check size={15} className="shrink-0" />
                  Available! Taking you to the next step…
                </div>
              )}

              <button
                type="button"
                onClick={checkAvailability}
                disabled={!checkIn || !checkOut || n <= 0 || checking}
                className="w-full py-4 bg-terracotta hover:bg-terracotta/90 disabled:opacity-40 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {checking
                  ? <><Loader2 size={16} className="animate-spin" /> Checking…</>
                  : <> Check Availability <ChevronRight size={16} /></>
                }
              </button>
            </div>
          )}

          {/* ══ STEP 2: Guest details ══════════════════════════════════ */}
          {step === 2 && (
            <form onSubmit={submitBooking} className="space-y-4">
              {/* Booking summary bar */}
              <div className="bg-[#f9f6f2] rounded-2xl p-4 text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-500">{fmtDate(checkIn)} → {fmtDate(checkOut)}</span>
                  <span className="font-bold text-deep-blue">{n} night{n !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">{guestCount} guest{guestCount !== 1 ? 's' : ''}</span>
                  {total && <span className="font-bold text-terracotta">{fmtPrice(total, room.currency)}</span>}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <User size={11} className="inline mr-1 -mt-0.5" />Full Name *
                </label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <Mail size={11} className="inline mr-1 -mt-0.5" />Email *
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <Phone size={11} className="inline mr-1 -mt-0.5" />Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+212 6xx xxx xxx"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>

              {/* Special requests */}
              <div>
                <label className="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <MessageSquare size={11} className="inline mr-1 -mt-0.5" />Special Requests
                </label>
                <textarea
                  rows={3}
                  value={requests}
                  onChange={e => setRequests(e.target.value)}
                  placeholder="Dietary needs, arrival time, celebrations…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                    : 'Confirm Reservation'
                  }
                </button>
              </div>
            </form>
          )}

          {/* ══ STEP 3: Confirmed ══════════════════════════════════════ */}
          {step === 3 && confirmed && (
            <div className="text-center py-4 space-y-5">
              {/* Success icon */}
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <Check size={36} className="text-emerald-500" />
              </div>

              <div>
                <h3 className="font-cormorant text-2xl font-semibold text-deep-blue mb-1">
                  Reservation Received!
                </h3>
                <p className="text-sm text-gray-500">
                  We'll confirm your booking within 24 hours.
                </p>
              </div>

              {/* Reference box */}
              <div className="bg-deep-blue/5 border border-deep-blue/10 rounded-2xl p-5 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Reference</span>
                  <span className="font-mono font-bold text-deep-blue text-sm">{confirmed.booking_ref}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Room</span>
                    <span className="font-medium text-deep-blue text-right max-w-[60%]">{confirmed.room_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-in</span>
                    <span className="font-medium text-deep-blue">{fmtDate(confirmed.check_in)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Check-out</span>
                    <span className="font-medium text-deep-blue">{fmtDate(confirmed.check_out)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Guests</span>
                    <span className="font-medium text-deep-blue">{confirmed.guests}</span>
                  </div>
                  {confirmed.total_price && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total</span>
                      <span className="font-bold text-terracotta">{fmtPrice(confirmed.total_price, confirmed.currency)}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                A confirmation will be sent to <strong className="text-gray-600">{confirmed.guest_email}</strong> once the hotel approves your reservation.
              </p>

              <button
                onClick={onClose}
                className="w-full py-4 bg-terracotta hover:bg-terracotta/90 text-white rounded-2xl font-semibold text-sm transition-colors"
              >
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
