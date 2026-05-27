import { Card, CardContent } from './ui/card'

const REVIEWS = [
  {
    initial: 'S',
    name: 'Sophie M.',
    origin: 'Paris, France',
    source: 'Booking.com',
    score: '9.6',
    text: '"An absolute gem in the heart of Asilah\'s medina. The rooftop terrace at sunset is unforgettable — Atlantic views with mint tea in hand. The staff treated us like family from the very first moment."',
  },
  {
    initial: 'J',
    name: 'James & Laura T.',
    origin: 'London, UK',
    source: 'Booking.com',
    score: '9.8',
    text: '"We stayed in the Suite avec Terrasse and it was worth every dirham. Beautifully decorated with authentic Moroccan craftsmanship, and breakfast on the private terrace each morning was truly magical."',
  },
  {
    initial: 'K',
    name: 'Karim B.',
    origin: 'Casablanca, Maroc',
    source: 'Google',
    score: '9.4',
    text: '"L\'hôtel est magnifique, très bien situé dans la médina. Les chambres sont propres et joliment décorées. Le personnel est accueillant et aux petits soins. Je recommande vivement !"',
  },
]

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 px-6 bg-sand">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 section-underline">
          <h2 className="font-cormorant text-[2.8rem] text-deep-blue">What Our Guests Say</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-7">
          {REVIEWS.map(r => (
            <Card
              key={r.name}
              className="p-6 border-[#f0ece5] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(27,58,75,0.12)] transition-all duration-300"
            >
              <CardContent className="p-0">
                {/* Stars + score */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-gold text-lg">★</span>
                    ))}
                  </div>
                  <span className="font-cormorant text-2xl font-bold text-deep-blue">{r.score}</span>
                </div>

                <p className="text-[0.93rem] text-gray-600 italic leading-relaxed mb-5">{r.text}</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-deep-blue flex items-center justify-center font-cormorant text-white text-xl font-bold shrink-0">
                    {r.initial}
                  </div>
                  <div>
                    <div className="font-bold text-deep-blue text-sm">{r.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{r.origin} · {r.source}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
