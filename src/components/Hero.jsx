import { ChevronDown } from 'lucide-react'
import { Button } from './ui/button'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative h-screen flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.58),rgba(0,0,0,0.48)), url(/hero-hotel-azayla.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundColor: '#1b3a4b',
      }}
    >
      <div className="fade-in-up px-4 flex flex-col items-center">
        {/* Eyebrow */}
        <p className="text-[0.65rem] text-white/60 uppercase tracking-[4px] mb-6">
          Boutique Riad · Asilah, Morocco
        </p>

        <h1 className="font-cormorant text-[clamp(3rem,9vw,5.5rem)] font-bold text-white mb-5 drop-shadow-lg leading-none">
          Azayla Hotel
        </h1>

        {/* Gold ornament */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-16 bg-gold/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          <div className="h-px w-16 bg-gold/60" />
        </div>

        <p className="text-lg text-sand/90 italic mb-10 drop-shadow tracking-wide">
          Where the Atlantic meets Moroccan Soul
        </p>

        <Button asChild size="lg">
          <a href="#contact">Reserve Your Stay</a>
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
