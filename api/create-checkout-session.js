import Stripe from 'stripe'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = (process.env.STRIPE_SECRET_KEY || '').trim()
  if (!secret) return res.status(500).json({ error: 'Stripe not configured' })

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })

  const {
    amount, currency,
    room_id, room_name,
    guest_name, guest_email, guest_phone, guest_requests,
    check_in, check_out, nights, guests,
    origin,
  } = req.body

  if (!amount || !currency) {
    return res.status(400).json({ error: 'Missing required fields: amount, currency' })
  }

  try {
    const nightsNum = Number(nights) || 1
    const guestsNum = Number(guests) || 1
    const baseOrigin = origin || 'https://azayla-hotel-clone.vercel.app'

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase().trim(),
            product_data: {
              name: `${room_name} — ${nightsNum} Night${nightsNum !== 1 ? 's' : ''}`,
              description: `Check-in: ${check_in} · Check-out: ${check_out} · ${guestsNum} guest${guestsNum !== 1 ? 's' : ''}`,
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: guest_email || undefined,
      metadata: {
        room_id:        String(room_id || ''),
        room_name:      room_name || '',
        guest_name:     guest_name || '',
        guest_email:    guest_email || '',
        guest_phone:    guest_phone || '',
        guest_requests: guest_requests || '',
        check_in:       check_in || '',
        check_out:      check_out || '',
        nights:         String(nightsNum),
        guests:         String(guestsNum),
        amount:         String(amount),
        currency:       currency,
      },
      return_url: `${baseOrigin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
    })

    res.status(200).json({ clientSecret: session.client_secret })
  } catch (err) {
    console.error('[Stripe Checkout Session]', err)
    res.status(500).json({ error: err.message })
  }
}
