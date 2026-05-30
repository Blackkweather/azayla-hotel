import { useState, useEffect } from 'react'
import {
  X, Users, Check, Loader2, AlertCircle,
  Phone, Mail, User, MessageSquare, Lock,
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '@/lib/supabase'
import CalendarPicker from './CalendarPicker'

// Load Stripe once — trim to strip any trailing newline from env var
const stripePromise = loadStripe((import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim())

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

function fmtPrice(n, currency) {
  return new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(n) +
    ' ' + (currency || 'MAD')
}

// ─── Step indicator ─────────────────────────────────────────────────────────

const STEP_LABELS = ['Dates', 'Details', 'Payment', 'Confirmed']

function Steps({ step }) {
  return (
    <div className="flex items-center justify-center mb-6 px-2">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1
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

// ─── Stripe payment form (Step 3) ────────────────────────────────────────────

function PaymentForm({ bookingId, bookingRef, amount, currency, guestEmail, onSuccess, onError }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [msg, setMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setMsg(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    })

    if (error) {
      setMsg(error.message)
      setProcessing(false)
      onError(error.message)
    } else if (paymentIntent?.status === 'succeeded') {
      // Mark booking as paid in Supabase
      await supabase
        .from('hotel_bookings')
        .update({
          status: 'paid',
          stripe_payment_intent_id: paymentIntent.id,
        })
        .eq('id', bookingId)

      onSuccess(paymentIntent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Amount summary */}
      <div className="flex items-center justify-between bg-[#f9f6f2] rounded-2xl px-5 py-4">
        <span className="text-sm text-gray-500">Total due today</span>
        <span className="text-lg font-bold text-terracotta">{fmtPrice(amount, currency)}</span>
      </div>

      {/* Stripe card form */}
      <div className="p-4 border border-gray-200 rounded-2xl">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {msg && (
        <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {msg}
        </div>
      )}

      {/* Security badge */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Lock size={11} />
        Secured by Stripe · SSL encrypted
      </p>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-4 bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        {processing
          ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
          : `Pay ${fmtPrice(amount, currency)}`
        }
      </button>
    </form>
  )
}

// ─── Main modal ──────────────────────────────────────────────────────────────

export default function BookingModal({ room, onClose }) {
  // ── Step 1 – Calendar
  const [checkIn,  setCheckIn]  = useState(null)
  const [checkOut, setCheckOut] = useState(null)
  const [guests,   setGuests]   = useState(1)
  const [checking, setChecking] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [bookedRanges, setBookedRanges] = useState([])

  // ── Step 2 – Details
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [requests, setRequests] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [detailsError, setDetailsError] = useState(null)

  // ── Step 3 – Payment
  const [clientSecret, setClientSecret] = useState(null)
  const [bookingId,    setBookingId]    = useState(null)
  const [bookingRef,   setBookingRef]   = useState(null)
  const [paymentError, setPaymentError] = useState(null)

  // ── Step 4 – Confirmed
  const [confirmed, setConfirmed] = useState(null)

  const [step, setStep] = useState(1)

  const n     = nightCount(checkIn, checkOut)
  const total = n > 0 && room.price_per_night ? n * Number(room.price_per_night) : null

  // Fetch booked ranges for this room so calendar can grey them out
  useEffect(() => {
    supabase
      .from('hotel_bookings')
      .select('check_in, check_out')
      .eq('room_id', room.id)
      .not('status', 'in', '("cancelled")')
      .then(({ data }) => setBookedRanges(data ?? []))
  }, [room.id])

  // ── Check availability & move to step 2 ───────────────────────────────
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
    if (count === 0) {
      setTimeout(() => setStep(2), 200)
    } else {
      setUnavailable(true)
    }
  }

  // ── Save booking + create Payment Intent ──────────────────────────────
  async function saveAndPay(e) {
    e.preventDefault()
    setSubmitting(true)
    setDetailsError(null)

    // 1. Insert booking (pending_payment)
    const { data: bk, error: bkErr } = await supabase
      .from('hotel_bookings')
      .insert({
        room_id:          room.id,
        room_name:        room.name,
        guest_name:       name.trim(),
        guest_email:      email.trim().toLowerCase(),
        guest_phone:      phone.trim() || null,
        check_in:         checkIn,
        check_out:        checkOut,
        guests:           Number(guests),
        total_price:      total,
        currency:         room.currency || 'MAD',
        status:           'pending_payment',
        special_requests: requests.trim() || null,
      })
      .select()
      .single()

    if (bkErr) {
      setDetailsError('Could not save booking. Please try again.')
      setSubmitting(false)
      return
    }

    setBookingId(bk.id)
    setBookingRef(bk.booking_ref)

    // 2. Create Stripe Payment Intent via Vercel API
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:      total,
          currency:    room.currency || 'MAD',
          booking_ref: bk.booking_ref,
          room_name:   room.name,
          guest_email: email.trim().toLowerCase(),
          guest_name:  name.trim(),
        }),
      })

      const json = await res.json()

      if (!res.ok || json.error) throw new Error(json.error || 'Payment setup failed')

      setClientSecret(json.clientSecret)
      setStep(3)
    } catch (err) {
      setDetailsError('Payment setup failed: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Payment success ────────────────────────────────────────────────────
  function handlePaymentSuccess(paymentIntent) {
    setConfirmed({
      booking_ref: bookingRef,
      room_name:   room.name,
      check_in:    checkIn,
      check_out:   checkOut,
      guests,
      total_price: total,
      currency:    room.currency || 'MAD',
      guest_email: email,
    })
    setStep(4)
  }

  // ── Stripe Elements appearance ────────────────────────────────────────
  const stripeAppearance = {
    theme: 'stripe',
    variables: {
      colorPrimary:     '#c17c5a',
      colorBackground:  '#ffffff',
      colorText:        '#1b3a4b',
      colorDanger:      '#df1b41',
      fontFamily:       'Nunito, system-ui, sans-serif',
      spacingUnit:      '4px',
      borderRadius:     '12px',
    },
  }

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[88vh] overflow-hidden">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 z-10 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Room header */}
        <div className="px-6 pt-4 pb-4 shrink-0 border-b border-gray-50">
          <div className="flex items-center gap-3">
            {room.images?.[0] && (
              <img src={room.images[0]} alt={room.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-sm" />
            )}
            <div className="min-w-0">
              <p className="font-cormorant text-[1.2rem] font-semibold text-deep-blue truncate">{room.name}</p>
              <p className="text-xs text-terracotta/80 uppercase tracking-wider">{room.subtitle}</p>
              {room.price_per_night && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {fmtPrice(room.price_per_night, room.currency)}
                  <span className="text-gray-400"> / night</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Steps indicator */}
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
                  setCheckIn(ci)
                  setCheckOut(co)
                  setUnavailable(false)
                }}
              />

              {/* Guest stepper */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Users size={14} className="text-gold" />
                  <label className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Guests</label>
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
                    <span>{fmtPrice(room.price_per_night, room.currency)} × {n} night{n !== 1 ? 's' : ''}</span>
                    <span>{fmtPrice(total, room.currency)}</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between font-bold">
                    <span className="text-deep-blue">Total</span>
                    <span className="text-terracotta">{fmtPrice(total, room.currency)}</span>
                  </div>
                </div>
              )}

              {/* Unavailable error */}
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
                  : 'Check Availability →'
                }
              </button>
            </div>
          )}

          {/* ════ STEP 2 — Guest details ════════════════════════════════ */}
          {step === 2 && (
            <form onSubmit={saveAndPay} className="space-y-4">
              {/* Summary bar */}
              <div className="bg-[#f9f6f2] rounded-2xl p-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">{fmtDate(checkIn)} → {fmtDate(checkOut)}</span>
                  <span className="font-bold text-deep-blue">{n} night{n !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">{guests} guest{guests !== 1 ? 's' : ''}</span>
                  {total && <span className="font-bold text-terracotta">{fmtPrice(total, room.currency)}</span>}
                </div>
              </div>

              {/* Fields */}
              {[
                { key: 'name',  label: 'Full Name', icon: <User size={11} />, type: 'text',  value: name,  set: setName,  placeholder: 'Your full name', required: true },
                { key: 'email', label: 'Email',     icon: <Mail size={11} />, type: 'email', value: email, set: setEmail, placeholder: 'your@email.com', required: true },
                { key: 'phone', label: 'Phone',     icon: <Phone size={11} />,type: 'tel',   value: phone, set: setPhone, placeholder: '+212 6xx xxx xxx', required: false },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    {f.icon} {f.label}{f.required && <span className="text-terracotta">*</span>}
                  </label>
                  <input
                    required={f.required}
                    type={f.type}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors"
                  />
                </div>
              ))}

              <div>
                <label className="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
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

              {detailsError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" /> {detailsError}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3.5 bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Setting up payment…</>
                    : 'Continue to Payment →'
                  }
                </button>
              </div>
            </form>
          )}

          {/* ════ STEP 3 — Stripe payment ═══════════════════════════════ */}
          {step === 3 && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: stripeAppearance }}
            >
              <PaymentForm
                bookingId={bookingId}
                bookingRef={bookingRef}
                amount={total}
                currency={room.currency || 'MAD'}
                guestEmail={email}
                onSuccess={handlePaymentSuccess}
                onError={msg => setPaymentError(msg)}
              />
            </Elements>
          )}

          {step === 3 && !clientSecret && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-terracotta" />
            </div>
          )}

          {/* ════ STEP 4 — Confirmation ═════════════════════════════════ */}
          {step === 4 && confirmed && (
            <div className="text-center py-4 space-y-5">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <Check size={36} className="text-emerald-500" />
              </div>

              <div>
                <h3 className="font-cormorant text-2xl font-semibold text-deep-blue mb-1">Booking Confirmed!</h3>
                <p className="text-sm text-gray-500">Payment received. Your stay is confirmed.</p>
              </div>

              <div className="bg-deep-blue/5 border border-deep-blue/10 rounded-2xl p-5 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Reference</span>
                  <span className="font-mono font-bold text-deep-blue text-sm">{confirmed.booking_ref}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="space-y-2 text-sm">
                  {[
                    ['Room',      confirmed.room_name],
                    ['Check-in',  fmtDate(confirmed.check_in)],
                    ['Check-out', fmtDate(confirmed.check_out)],
                    ['Guests',    confirmed.guests],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-deep-blue text-right max-w-[60%]">{v}</span>
                    </div>
                  ))}
                  {confirmed.total_price && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paid</span>
                      <span className="font-bold text-emerald-600">{fmtPrice(confirmed.total_price, confirmed.currency)}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                A receipt has been sent to <strong className="text-gray-600">{confirmed.guest_email}</strong>
              </p>

              <button onClick={onClose}
                className="w-full py-4 bg-terracotta hover:bg-terracotta/90 text-white rounded-2xl font-semibold text-sm transition-colors">
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
