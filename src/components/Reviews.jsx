import { Card, CardContent } from './ui/card'

const REVIEWS = [
  {
    initial: 'S',
    name: 'Sophie M.',
    origin: 'Paris, France',
    room: 'Suite with Terrace',
    year: '2025',
    text: '"An absolute gem in the heart of Asilah\'s medina. The rooftop terrace at sunset is unforgettable — Atlantic views with mint tea in hand. The staff treated us like family from the very first moment."',
  },
  {
    initial: 'J',
    name: 'James & Laura T.',
    origin: 'London, UK',
    room: 'Suite with Terrace',
    year: '2025',
    text: '"We stayed in the suite and it was worth every dirham. Beautifully decorated with authentic Moroccan craftsmanship, and waking up to that private terrace each morning was truly magical."',
  },
  {
    initial: 'K',
    name: 'Karim B.',
    origin: 'Casablanca, Morocco',
    room: 'Deluxe Double Room',
    year: '2024',
    text: '"L\'hôtel est magnifique, très bien situé dans la médina. Les chambres sont propres et joliment décorées. Le personnel est accueillant et aux petits soins. Je recommande vivement !"',
  },
]

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 px-6 bg-sand">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="eyebrow mb-3">Guest Experiences</p>
          <h2 className="font-cormorant text-[2.8rem] text-deep-blue section-underline">What Our Guests Say</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-7">
          {REVIEWS.map(r => (
            <Card
              key={r.name}
              className="p-6 border-[#f0ece5] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(27,58,75,0.12)] transition-all duration-300"
            >
              <CardContent className="p-0">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-gold text-lg">★</span>
                  ))}
                </div>

                <p className="text-[0.93rem] text-gray-600 italic leading-relaxed mb-5">{r.text}</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-deep-blue flex items-center justify-center font-cormorant text-white text-xl font-bold shrink-0">
                    {r.initial}
                  </div>
                  <div>
                    <div className="font-bold text-deep-blue text-sm">{r.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{r.origin}</div>
                    <div className="text-[0.68rem] text-terracotta/80 mt-0.5 uppercase tracking-wide">{r.room} · {r.year}</div>
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
