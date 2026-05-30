import Stripe from 'stripe'

export default async function handler(req, res) {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = (process.env.STRIPE_SECRET_KEY || '').trim()
  if (!secret) return res.status(500).json({ error: 'Stripe not configured' })

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })

  const { amount, currency, booking_ref, room_name, guest_email, guest_name } = req.body

  if (!amount || !currency || !booking_ref) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Stripe amounts are in smallest currency unit (cents / centimes)
    // MAD, EUR, USD are all non-zero-decimal → multiply by 100
    const amountInt = Math.round(Number(amount) * 100)

    const intent = await stripe.paymentIntents.create({
      amount:   amountInt,
      currency: currency.toLowerCase().trim(),
      metadata: { booking_ref, room_name, guest_name: guest_name || '' },
      receipt_email: guest_email || undefined,
      automatic_payment_methods: { enabled: true },
    })

    res.status(200).json({ clientSecret: intent.client_secret })
  } catch (err) {
    console.error('[Stripe]', err)
    res.status(500).json({ error: err.message })
  }
}
