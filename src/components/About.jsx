import { useScrollFade } from '@/hooks/useScrollFade'

const HIGHLIGHTS = [
  {
    icon: (
      <svg className="w-10 h-10 text-terracotta mx-auto mb-3" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 30c3-4 6-6 9-6s6 2 9 6 6 6 9 6 6-2 9-6"/>
        <path d="M4 22c3-4 6-6 9-6s6 2 9 6 6 6 9 6 6-2 9-6"/>
      </svg>
    ),
    title: 'Sea Views',
    desc: 'Panoramic Atlantic ocean vistas',
  },
  {
    icon: (
      <svg className="w-10 h-10 text-terracotta mx-auto mb-3" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="36" width="36" height="4" rx="1"/>
        <path d="M12 36V22a12 12 0 0 1 24 0v14"/>
        <line x1="24" y1="10" x2="24" y2="6"/>
        <path d="M20 36v-6h8v6"/>
      </svg>
    ),
    title: 'Medina Location',
    desc: 'Heart of historic Asilah',
  },
  {
    icon: (
      <svg className="w-10 h-10 text-terracotta mx-auto mb-3" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="24" y1="4" x2="24" y2="10"/>
        <path d="M16 10h16l4 6v16l-4 6H16l-4-6V16z"/>
        <path d="M20 10v28M28 10v28"/>
        <path d="M12 22h24M12 30h24"/>
        <line x1="24" y1="38" x2="24" y2="44"/>
      </svg>
    ),
    title: 'Rooftop Terrace',
    desc: 'Sunrise to sunset relaxation',
  },
]

export default function About() {
  const ref = useScrollFade()

  return (
    <section id="about" className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16 scrolled-fade" ref={ref}>
        <p className="eyebrow mb-3">Our Story</p>
        <h2 className="font-cormorant text-[2.8rem] text-deep-blue section-underline">About Azayla Hotel</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[1.1rem] text-deep-blue/80 leading-relaxed mb-5">
            Nestled in the heart of Asilah's whitewashed medina, Azayla Hotel offers an intimate boutique experience where traditional Moroccan hospitality meets Atlantic coastal charm. Our carefully restored riad features airy courtyards, handcrafted Moroccan details, and the gentle ocean breeze that defines this charming coastal town.
          </p>
          <p className="text-[1.1rem] text-deep-blue/80 leading-relaxed mb-8">
            Each corner tells a story of Asilah's artistic heritage, from the blue doors that frame our hallways to the rooftop terrace where sunrise paints the Atlantic gold.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {HIGHLIGHTS.map(h => (
              <div
                key={h.title}
                className="text-center p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                {h.icon}
                <h3 className="font-cormorant font-semibold text-deep-blue text-lg mb-1">{h.title}</h3>
                <p className="text-sm text-gray-500">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-[0_15px_45px_rgba(27,58,75,0.15)] aspect-[4/3] group">
          <img
            src="/images/attractions/asilah-medina/9.jpg"
            alt="Asilah Medina"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
