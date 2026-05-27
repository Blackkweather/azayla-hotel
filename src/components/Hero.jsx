import { ChevronDown } from 'lucide-react'
import { Button } from './ui/button'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative h-screen flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.42),rgba(0,0,0,0.42)), url(/hero-hotel-azayla.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1b3a4b',
      }}
    >
      <div className="fade-in-up px-4">
        {/* ── Rating Badge ── */}
        <div className="inline-flex items-center gap-4 bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl px-5 py-3 mb-7">
          {/* Score */}
          <div className="text-center leading-none">
            <span className="font-cormorant text-4xl font-bold text-gold block">9.2</span>
            <span className="text-white/90 text-[11px] font-semibold tracking-wider uppercase mt-0.5 block">
              Wonderful
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-white/25 shrink-0" />

          {/* Source */}
          <div className="text-left">
            <div className="text-white text-sm font-semibold">127+ verified reviews</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[#003580] bg-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                booking
              </span>
              <span className="text-white/60 text-xs">.com</span>
            </div>
          </div>
        </div>

        <h1 className="font-cormorant text-[clamp(2.5rem,8vw,4.5rem)] font-bold text-white mb-3 drop-shadow-lg">
          Azayla Hotel
        </h1>
        <p className="text-xl text-sand italic mb-10 drop-shadow">
          Where the Atlantic meets Moroccan Soul
        </p>

        <Button asChild size="lg">
          <a
            href="https://www.booking.com/hotel/ma/azayla-asilah.fr.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Now
          </a>
        </Button>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        aria-label="Scroll down"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60 text-[0.65rem] uppercase tracking-[2px] no-underline hover:text-white/90 transition-colors animate-bounce"
      >
        <span>Discover</span>
        <ChevronDown size={20} />
      </a>
    </section>
  )
}
