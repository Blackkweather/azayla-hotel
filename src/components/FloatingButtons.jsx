import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={cn(
        'fixed bottom-5 right-5 z-[900] w-11 h-11 rounded-full bg-deep-blue text-white flex items-center justify-center shadow-[0_4px_15px_rgba(27,58,75,0.35)] hover:bg-terracotta hover:-translate-y-0.5 transition-all duration-300',
        showTop ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-3 invisible'
      )}
    >
      <ArrowUp size={18} />
    </button>
  )
}
