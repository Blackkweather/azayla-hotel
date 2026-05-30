import Stripe from 'stripe'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const secret = (process.env.STRIPE_SECRET_KEY || '').trim()
  if (!secret) return res.status(500).json({ error: 'Stripe not configured' })

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })

  const { session_id } = req.query
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' })

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)

    res.status(200).json({
      paid:            session.payment_status === 'paid',
      status:          session.payment_status,
      paymentIntentId: session.payment_intent,
      customerEmail:   session.customer_details?.email || null,
      metadata:        session.metadata || {},
    })
  } catch (err) {
    console.error('[Verify Checkout Session]', err)
    res.status(500).json({ error: err.message })
  }
}
