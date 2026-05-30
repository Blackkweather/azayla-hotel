import { useState, useEffect, useRef } from 'react'
import { Check, Loader2, AlertCircle, Home, CalendarDays, Users, CreditCard } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

/**
 * Format an already-converted amount in a specific currency.
 * Uses Intl.NumberFormat with the currency's own formatting conventions.
 */
function fmtAmount(n, currency) {
  try {
    return new Intl.NumberFormat('en', {
      style:                'currency',
      currency:             currency || 'MAD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Number(n))
  } catch {
    return `${Number(n).toLocaleString()} ${currency || 'MAD'}`
  }
}

export default function BookingSuccess() {
  const [status, setStatus]   = useState('loading') // loading | success | error
  const [booking, setBooking] = useState(null)
  const [error, setError]     = useState(null)
  const didRun = useRef(false)

  useEffect(() => {
    // Strict-mode double-invoke guard
    if (didRun.current) return
    didRun.current = true

    const params    = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')

    if (!sessionId) {
      setStatus('error')
      setError('No booking session found. Please try again.')
      return
    }

    async function verify() {
      try {
        // 1 — Verify with Stripe (server-side check)
        const verifyRes = await fetch(`/api/verify-checkout-session?session_id=${sessionId}`)
        const verifyData = await verifyRes.json()

        if (!verifyData.paid) {
          setStatus('error')
          setError(
            verifyData.status === 'unpaid'
              ? 'Payment was not completed. Please try again.'
              : `Payment status: ${verifyData.status}. Please contact support.`
          )
          return
        }

        const meta = verifyData.metadata || {}

        // 2 — Idempotency: check if booking already saved
        const { data: existing } = await supabase
          .from('hotel_bookings')
          .select('id, booking_ref')
          .eq('stripe_payment_intent_id', verifyData.paymentIntentId)
          .maybeSingle()

        let saved = existing

        if (!existing) {
          // 3 — Save booking to DB (first time only)
          const { data: inserted, error: dbErr } = await supabase
            .from('hotel_bookings')
            .insert({
              room_id:                  meta.room_id   || null,
              room_name:                meta.room_name || null,
              guest_name:               meta.guest_name,
              guest_email:              meta.guest_email,
              guest_phone:              meta.guest_phone || null,
              check_in:                 meta.check_in,
              check_out:                meta.check_out,
              guests:                   Number(meta.guests  || 1),
              total_price:              Number(meta.amount  || 0),
              currency:                 meta.currency  || 'MAD',
              status:                   'paid',
              special_requests:         meta.guest_requests || null,
              stripe_payment_intent_id: verifyData.paymentIntentId,
            })
            .select()
            .single()

          if (dbErr) throw new Error('Could not save booking: ' + dbErr.message)
          saved = inserted
        }

        setBooking({ ...saved, meta })
        setStatus('success')
      } catch (err) {
        console.error('[BookingSuccess]', err)
        setStatus('error')
        setError(err.message || 'An unexpected error occurred.')
      }
    }

    verify()
  }, [])

  return (
    <div className="min-h-screen bg-[#f9f6f2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/">
            <img
              src="/logo-removebg-preview.png"
              alt="Hotel Azayla"
              className="h-16 mx-auto hover:opacity-80 transition-opacity"
            />
          </a>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* ── Loading ── */}
          {status === 'loading' && (
            <div className="p-10 text-center">
              <Loader2 size={44} className="animate-spin text-terracotta mx-auto mb-5" />
              <p className="font-cormorant text-xl text-deep-blue mb-1">Confirming your reservation…</p>
              <p className="text-sm text-gray-400">This only takes a moment.</p>
            </div>
          )}

          {/* ── Error ── */}
          {status === 'error' && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h2 className="font-cormorant text-2xl font-semibold text-deep-blue mb-2">
                Something went wrong
              </h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">{error}</p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-terracotta hover:bg-terracotta/90 text-white rounded-2xl text-sm font-semibold transition-colors"
              >
                <Home size={15} /> Back to Hotel
              </a>
            </div>
          )}

          {/* ── Success ── */}
          {status === 'success' && booking && (
            <>
              {/* Green header */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-white" strokeWidth={2.5} />
                </div>
                <h2 className="font-cormorant text-3xl font-semibold mb-1">
                  Booking Confirmed!
                </h2>
                <p className="text-emerald-100 text-sm">
                  Payment received · Your stay is reserved
                </p>
              </div>

              {/* Body */}
              <div className="p-7 space-y-5">

                {/* Booking ref */}
                {booking.booking_ref && (
                  <div className="flex items-center justify-between bg-deep-blue/5 rounded-xl px-4 py-3">
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                      Reference
                    </span>
                    <span className="font-mono font-bold text-deep-blue text-sm">
                      {booking.booking_ref}
                    </span>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-3">

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CalendarDays size={14} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-[0.65rem] text-gray-400 uppercase tracking-widest font-bold mb-0.5">
                        Stay
                      </p>
                      <p className="text-sm font-medium text-deep-blue">
                        {fmtDate(booking.meta.check_in)}
                      </p>
                      <p className="text-xs text-gray-400">
                        → {fmtDate(booking.meta.check_out)} &nbsp;·&nbsp; {booking.meta.nights} night{Number(booking.meta.nights) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Users size={14} className="text-terracotta" />
                    </div>
                    <div>
                      <p className="text-[0.65rem] text-gray-400 uppercase tracking-widest font-bold mb-0.5">
                        Room &amp; Guests
                      </p>
                      <p className="text-sm font-medium text-deep-blue">{booking.meta.room_name}</p>
                      <p className="text-xs text-gray-400">
                        {booking.meta.guests} guest{Number(booking.meta.guests) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard size={14} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[0.65rem] text-gray-400 uppercase tracking-widest font-bold mb-0.5">
                        Amount Paid
                      </p>
                      <p className="text-sm font-bold text-emerald-600">
                        {fmtAmount(booking.meta.amount, booking.meta.currency)}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Email notice */}
                {booking.meta.guest_email && (
                  <p className="text-xs text-center text-gray-400 border-t border-gray-50 pt-4">
                    Confirmation sent to{' '}
                    <strong className="text-gray-600">{booking.meta.guest_email}</strong>
                  </p>
                )}

                {/* CTA */}
                <a
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-terracotta hover:bg-terracotta/90 active:scale-[0.98] text-white rounded-2xl font-semibold text-sm transition-all"
                >
                  <Home size={15} /> Back to Azayla Hotel
                </a>

              </div>
            </>
          )}

        </div>

        {/* Footer tagline */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Hotel Azayla · 20 Rue Ibn Rochd, Asilah, Maroc
        </p>

      </div>
    </div>
  )
}
