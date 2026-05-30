import { useState, useEffect } from 'react'
import {
  X, Users, Check, Loader2, AlertCircle,
  Phone, Mail, User, MessageSquare, Lock,
} from 'lucide-react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '@/lib/supabase'
import CalendarPicker from './CalendarPicker'

// Stripe.js is loaded lazily — only when the user enters the details step.
// This prevents the Stripe Developer overlay from appearing on normal page visits.

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

// ─── Stripe payment form ─────────────────────────────────────────────────────

function PaymentForm({ amount, currency, onSuccess, onBack }) {
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
      confirmParams: { return_url: window.location.origin },
      redirect: 'if_required',
    })

    if (error) {
      setMsg(error.message)
      setProcessing(false)
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Amount */}
      <div className="flex items-center justify-between bg-[#f9f6f2] rounded-2xl px-5 py-4">
        <span className="text-sm text-gray-500">Total due</span>
        <span className="text-lg font-bold text-terracotta">{fmtPrice(amount, currency)}</span>
      </div>

      {/* Stripe card */}
      <div className="p-4 border border-gray-200 rounded-2xl">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {msg && (
        <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={15} className="shrink-0 mt-0.5" /> {msg}
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Lock size={11} /> Secured by Stripe · SSL encrypted
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button type="submit" disabled={!stripe || processing}
          className="flex-1 py-3.5 bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
          {processing
            ? <><Loader2 size={16} className="animate-spin" /> Processing…</>
            : `Pay ${fmtPrice(amount, currency)}`}
        </button>
      </div>
    </form>
  )
}

// ─── Main modal ──────────────────────────────────────────────────────────────

export default function BookingModal({ room, onClose }) {
  // Step 1
  const [checkIn,     setCheckIn]     = useState(null)
  const [checkOut,    setCheckOut]    = useState(null)
  const [guests,      setGuests]      = useState(1)
  const [checking,    setChecking]    = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [bookedRanges, setBookedRanges] = useState([])

  // Step 2
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [phone,    setPhone]    = useState('')
  const [requests, setRequests] = useState('')

  // Step 3 — Payment Intent pre-fetched in background
  const [clientSecret,  setClientSecret]  = useState(null)
  const [piError,       setPiError]       = useState(null)
  const [stripeInst,    setStripeInst]    = useState(null)

  // Step 4
  const [confirmed, setConfirmed] = useState(null)

  const [step, setStep] = useState(1)

  const n     = nightCount(checkIn, checkOut)
  const total = n > 0 && room.price_per_night ? n * Number(room.price_per_night) : null

  // Fetch booked ranges so calendar greys them out
  useEffect(() => {
    supabase
      .from('hotel_bookings')
      .select('check_in, check_out')
      .eq('room_id', room.id)
      .not('status', 'in', '("cancelled")')
      .then(({ data }) => setBookedRanges(data ?? []))
  }, [room.id])

  // ── Pre-load Stripe + Payment Intent the moment step 2 starts ──────────
  // Stripe.js loads in background while the user types their details,
  // so step 3 (payment form) appears instantly with zero delay.
  useEffect(() => {
    if (step !== 2 || !total || clientSecret) return

    // Lazy-load Stripe only now (not on page load — avoids the dev overlay)
    import('@stripe/stripe-js').then(({ loadStripe }) => {
      const p = loadStripe((import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim())
      setStripeInst(p)
    })

    fetch('/api/create-payment-intent', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount:    total,
        currency:  room.currency || 'MAD',
        room_name: room.name,
      }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.error) throw new Error(json.error)
        setClientSecret(json.clientSecret)
      })
      .catch(err => setPiError('Payment setup failed: ' + err.message))
  }, [step, total])

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

  // ── Step 2 → 3 — Just validate form + wait for clientSecret ───────────
  function goToPayment(e) {
    e.preventDefault()
    if (!clientSecret) {
      // Still loading — rare; wait briefly
      setPiError('Payment is still loading, please wait a moment.')
      return
    }
    setPiError(null)
    setStep(3)
  }

  // ── Step 3 — Payment success: save booking, then step 4 ───────────────
  async function handlePaymentSuccess(paymentIntent) {
    const { data: bk } = await supabase
      .from('hotel_bookings')
      .insert({
        room_id:                  room.id,
        room_name:                room.name,
        guest_name:               name.trim(),
        guest_email:              email.trim().toLowerCase(),
        guest_phone:              phone.trim() || null,
        check_in:                 checkIn,
        check_out:                checkOut,
        guests:                   Number(guests),
        total_price:              total,
        currency:                 room.currency || 'MAD',
        status:                   'paid',
        special_requests:         requests.trim() || null,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select()
      .single()

    setConfirmed({ ...(bk || {}), guest_email: email, total_price: total, currency: room.currency || 'MAD' })
    setStep(4)
  }

  // Stripe Elements appearance matching hotel theme
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary:    '#c17c5a',
      colorBackground: '#ffffff',
      colorText:       '#1b3a4b',
      colorDanger:     '#df1b41',
      fontFamily:      'Nunito, system-ui, sans-serif',
      borderRadius:    '12px',
    },
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[88vh] overflow-hidden">

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 z-10 transition-colors">
          <X size={16} />
        </button>

        {/* Drag handle (mobile) */}
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
                  <label className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Guests</label>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                  <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}
                    className="w-11 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-deep-blue hover:border-terracotta text-lg font-bold transition-colors">−</button>
                  <span className="flex-1 text-center font-semibold text-deep-blue">{guests}</span>
                  <button type="button" onClick={() => setGuests(g => Math.min(room.guests || 4, g + 1))}
                    className="w-11 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-deep-blue hover:border-terracotta text-lg font-bold transition-colors">+</button>
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

              {unavailable && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  Not available for these dates. Please choose different dates.
                </div>
              )}

              <button type="button" onClick={checkAvailability}
                disabled={!checkIn || !checkOut || n <= 0 || checking}
                className="w-full py-4 bg-terracotta hover:bg-terracotta/90 disabled:opacity-40 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
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
                  {total && <span className="font-bold text-terracotta">{fmtPrice(total, room.currency)}</span>}
                </div>
              </div>

              {/* Fields */}
              {[
                { k: 'name',  label: 'Full Name', icon: <User size={11} />,        type: 'text',  val: name,     set: setName,     ph: 'Your full name',     req: true  },
                { k: 'email', label: 'Email',     icon: <Mail size={11} />,        type: 'email', val: email,    set: setEmail,    ph: 'your@email.com',     req: true  },
                { k: 'phone', label: 'Phone',     icon: <Phone size={11} />,       type: 'tel',   val: phone,    set: setPhone,    ph: '+212 6xx xxx xxx',   req: false },
              ].map(f => (
                <div key={f.k}>
                  <label className="flex items-center gap-1 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    {f.icon} {f.label}{f.req && <span className="text-terracotta">*</span>}
                  </label>
                  <input required={f.req} type={f.type} value={f.val}
                    onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors" />
                </div>
              ))}

              <div>
                <label className="flex items-center gap-1 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <MessageSquare size={11} /> Special Requests
                </label>
                <textarea rows={3} value={requests} onChange={e => setRequests(e.target.value)}
                  placeholder="Arrival time, celebrations, dietary needs…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors resize-none" />
              </div>

              {piError && (
                <div className="flex items-start gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" /> {piError}
                </div>
              )}

              {/* Loading indicator while PI is fetching in background */}
              {!clientSecret && !piError && (
                <p className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                  <Loader2 size={12} className="animate-spin" /> Preparing payment…
                </p>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="px-5 py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button type="submit" disabled={!clientSecret}
                  className="flex-1 py-3.5 bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white rounded-2xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  {!clientSecret
                    ? <><Loader2 size={15} className="animate-spin" /> Loading…</>
                    : 'Continue to Payment →'}
                </button>
              </div>
            </form>
          )}

          {/* ════ STEP 3 — Payment (instant — clientSecret already ready) ══ */}
          {step === 3 && clientSecret && stripeInst && (
            <Elements stripe={stripeInst} options={{ clientSecret, appearance }}>
              <PaymentForm
                amount={total}
                currency={room.currency || 'MAD'}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep(2)}
              />
            </Elements>
          )}

          {/* ════ STEP 4 — Confirmed ════════════════════════════════════ */}
          {step === 4 && confirmed && (
            <div className="text-center py-4 space-y-5">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <Check size={36} className="text-emerald-500" />
              </div>

              <div>
                <h3 className="font-cormorant text-2xl font-semibold text-deep-blue mb-1">Booking Confirmed!</h3>
                <p className="text-sm text-gray-500">Payment received · your stay is locked in.</p>
              </div>

              <div className="bg-deep-blue/5 border border-deep-blue/10 rounded-2xl p-5 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">Reference</span>
                  <span className="font-mono font-bold text-deep-blue text-sm">{confirmed.booking_ref}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="space-y-2 text-sm">
                  {[
                    ['Room',      room.name],
                    ['Check-in',  fmtDate(checkIn)],
                    ['Check-out', fmtDate(checkOut)],
                    ['Guests',    guests],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-deep-blue">{v}</span>
                    </div>
                  ))}
                  {total && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paid</span>
                      <span className="font-bold text-emerald-600">{fmtPrice(total, room.currency)}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Receipt sent to <strong className="text-gray-600">{email}</strong>
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
