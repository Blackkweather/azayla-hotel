import { useState, useEffect } from 'react'
import {
  X, Users, Check, Loader2, AlertCircle,
  Phone, Mail, User, MessageSquare, ChevronLeft,
} from 'lucide-react'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { supabase } from '@/lib/supabase'
import { useCurrency } from '@/context/LanguageContext'
import CalendarPicker from './CalendarPicker'

// Stripe.js loaded lazily — only when user clicks "Continue to Payment"

// ─── Helpers ────────────────────────────────────────────────────────────────

function nightCount(ci, co) {
  if (!ci || !co) return 0
  return Math.max(0, Math.round((new Date(co) - new Date(ci)) / 86400000))
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─── Step indicator (3 steps now — success is its own page) ─────────────────

const STEP_LABELS = ['Dates', 'Details', 'Payment']

function Steps({ step }) {
  return (
    <div className="flex items-center justify-center mb-6 px-2">
      {STEP_LABELS.map((label, i) => {
        const n      = i + 1
        const active = step === n
        const done   = step > n
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done   ? 'bg-emerald-500 text-white' :
                active ? 'bg-terracotta text-white shadow-sm scale-110' :
                         'bg-gray-100 text-gray-400'
              }`}>
                {done ? <Check size={13} /> : n}
              </div>
              <span className={`text-[0.55rem] mt-1 font-bold uppercase tracking-wide ${
                active ? 'text-terracotta' : done ? 'text-emerald-500' : 'text-gray-300'
              }`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-8 sm:w-10 h-px mx-1 mb-4 ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main modal ──────────────────────────────────────────────────────────────

export default function BookingModal({ room, onClose }) {
  const { currency, formatPrice, getAmount } = useCurrency()

  // Step 1
  const [checkIn,      setCheckIn]      = useState(null)
  const [checkOut,     setCheckOut]     = useState(null)
  const [guests,       setGuests]       = useState(1)
  const [checking,     setChecking]     = useState(false)
  const [unavailable,  setUnavailable]  = useState(false)
  const [bookedRanges, setBookedRanges] = useState([])

  // Step 2
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [requests, setRequests] = useState('')

  // Step 3 — Checkout Session
  const [clientSecret,     setClientSecret]     = useState(null)
  const [stripeInst,       setStripeInst]       = useState(null)
  const [creatingSession,  setCreatingSession]  = useState(false)
  const [sessionError,     setSessionError]     = useState(null)

  const [step, setStep] = useState(1)

  const n        = nightCount(checkIn, checkOut)
  // totalMAD = raw base amount; total = converted to visitor's currency for display + payment
  const totalMAD = n > 0 && room.price_per_night ? n * Number(room.price_per_night) : null
  const total    = totalMAD ? getAmount(totalMAD) : null

  // Fetch booked ranges so calendar greys them out
  useEffect(() => {
    supabase
      .from('hotel_bookings')
      .select('check_in, check_out')
      .eq('room_id', room.id)
      .not('status', 'in', '("cancelled")')
      .then(({ data }) => setBookedRanges(data ?? []))
  }, [room.id])

  // ── Step 1 — Availability check ────────────────────────────────────────
  async function checkAvailability() {
    if (!checkIn || !checkOut || n <= 0) return
    setChecking(true)
    setUnavailable(false)

    const { count } = await supabase
      .from('hotel_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', room.id)
      .not('status', 'in', '("cancelled")')
      .lt('check_in', checkOut)
      .gt('check_out', checkIn)

    setChecking(false)
    if (count === 0) setTimeout(() => setStep(2), 150)
    else setUnavailable(true)
  }

  // ── Step 2 → 3 — Create Checkout Session with full guest details ───────
  async function goToPayment(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setCreatingSession(true)
    setSessionError(null)

    try {
      // Lazy-load Stripe only now
      if (!stripeInst) {
        const { loadStripe } = await import('@stripe/stripe-js')
        const inst = loadStripe((import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim())
        setStripeInst(inst)
      }

      const res = await fetch('/api/create-checkout-session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:          total,            // already converted to visitor's currency
          currency:        currency,         // detected from IP (EUR, GBP, USD, MAD, …)
          room_id:         room.id,
          room_name:       room.name,
          guest_name:      name.trim(),
          guest_email:     email.trim().toLowerCase(),
          guest_phone:     phone.trim() || '',
          guest_requests:  requests.trim() || '',
          check_in:        checkIn,
          check_out:       checkOut,
          nights:          n,
          guests:          Number(guests),
          origin:          window.location.origin,
        }),
      })

      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setClientSecret(json.clientSecret)
      setStep(3)
    } catch (err) {
      setSessionError('Payment setup failed: ' + err.message)
    } finally {
      setCreatingSession(false)
    }
  }

  // ── Go back from step 3 → 2 (clear session so a fresh one is created) ──
  function backToDetails() {
    setStep(2)
    setClientSecret(null)
    setSessionError(null)
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all ${
        step === 3 ? 'max-h-[96vh] sm:max-h-[92vh]' : 'max-h-[94vh] sm:max-h-[88vh]'
      }`}>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 z-10 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Drag handle (mobile) */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Room header */}
        <div className="px-6 pt-4 pb-4 shrink-0 border-b border-gray-50">
          <div className="flex items-center gap-3">
            {room.images?.[0] && (
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-sm"
              />
            )}
            <div className="min-w-0">
              <p className="font-cormorant text-[1.2rem] font-semibold text-deep-blue truncate">{room.name}</p>
              <p className="text-xs text-terracotta/80 uppercase tracking-wider">{room.subtitle}</p>
              {room.price_per_night && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatPrice(room.price_per_night)}
                  <span className="text-gray-400"> / night</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 pt-5 shrink-0">
          <Steps step={step} />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8">

          {/* ════ STEP 1 — Calendar ════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              <CalendarPicker
                checkIn={checkIn}
                checkOut={checkOut}
                bookedRanges={bookedRanges}
                onChange={({ checkIn: ci, checkOut: co }) => {
                  setCheckIn(ci); setCheckOut(co); setUnavailable(false)
                }}
              />

              {/* Guests */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Users size={13} className="text-gold" />
                  <label className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">
                    Guests
                  </label>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setGuests(g => Math.max(1, g - 1))}
                    className="w-11 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-deep-blue hover:border-terracotta text-lg font-bold transition-colors"
                  >−</button>
                  <span className="flex-1 text-center font-semibold text-deep-blue">{guests}</span>
                  <button
                    type="button"
                    onClick={() => setGuests(g => Math.min(room.guests || 4, g + 1))}
                    className="w-11 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-deep-blue hover:border-terracotta text-lg font-bold transition-colors"
                  >+</button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-1">Max {room.guests || 4} guests</p>
              </div>

              {/* Price preview */}
              {n > 0 && total && (
                <div className="bg-[#f9f6f2] rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPrice(room.price_per_night)} × {n} night{n !== 1 ? 's' : ''}</span>
                    <span>{formatPrice(totalMAD)}</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between font-bold">
                    <span className="text-deep-blue">Total</span>
                    <span className="text-terracotta">{formatPrice(totalMAD)}</span>
                  </div>
                </div>
              )}

              {unavailable && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  Not available for these dates. Please choose different dates.
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
                  : 'Check Availability →'}
              </button>
            </div>
          )}

          {/* ════ STEP 2 — Guest details ════════════════════════════════ */}
          {step === 2 && (
            <form onSubmit={goToPayment} className="space-y-4">
              {/* Summary */}
              <div className="bg-[#f9f6f2] rounded-2xl p-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">{fmtDate(checkIn)} → {fmtDate(checkOut)}</span>
                  <span className="font-bold text-deep-blue">{n} night{n !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">{guests} guest{guests !== 1 ? 's' : ''}</span>
                  {totalMAD && <span className="font-bold text-terracotta">{formatPrice(totalMAD)}</span>}
                </div>
              </div>

              {/* Fields */}
              {[
                { k: 'name',  label: 'Full Name', icon: <User  size={11} />, type: 'text',  val: name,  set: setName,  ph: 'Your full name',   req: true  },
                { k: 'email', label: 'Email',     icon: <Mail  size={11} />, type: 'email', val: email, set: setEmail, ph: 'your@email.com',   req: true  },
                { k: 'phone', label: 'Phone',     icon: <Phone size={11} />, type: 'tel',   val: phone, set: setPhone, ph: '+212 6xx xxx xxx', req: false },
              ].map(f => (
                <div key={f.k}>
                  <label className="flex items-center gap-1 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    {f.icon} {f.label}{f.req && <span className="text-terracotta">*</span>}
                  </label>
                  <input
                    required={f.req}
                    type={f.type}
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    placeholder={f.ph}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors"
                  />
                </div>
              ))}

              <div>
                <label className="flex items-center gap-1 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <MessageSquare size={11} /> Special Requests
                </label>
                <textarea
                  rows={3}
                  value={requests}
                  onChange={e => setRequests(e.target.value)}
                  placeholder="Arrival time, celebrations, dietary needs…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors resize-none"
                />
              </div>

              {sessionError && (
                <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" /> {sessionError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={creatingSession}
                  className="flex-1 py-3.5 bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {creatingSession
                    ? <><Loader2 size={15} className="animate-spin" /> Setting up payment…</>
                    : 'Continue to Payment →'}
                </button>
              </div>
            </form>
          )}

          {/* ════ STEP 3 — Stripe Embedded Checkout ════════════════════ */}
          {step === 3 && (
            <div className="space-y-4">

              {/* Back link */}
              <button
                type="button"
                onClick={backToDetails}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-terracotta transition-colors"
              >
                <ChevronLeft size={14} /> Change details
              </button>

              {/* Booking summary pill */}
              {totalMAD && (
                <div className="flex items-center justify-between bg-[#f9f6f2] rounded-xl px-4 py-3 text-sm">
                  <span className="text-gray-500">{n} night{n !== 1 ? 's' : ''} · {guests} guest{guests !== 1 ? 's' : ''}</span>
                  <span className="font-bold text-terracotta">{formatPrice(totalMAD)}</span>
                </div>
              )}

              {/* Stripe Embedded Checkout */}
              {clientSecret && stripeInst ? (
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <EmbeddedCheckoutProvider
                    stripe={stripeInst}
                    options={{ clientSecret }}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={28} className="animate-spin text-terracotta" />
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
