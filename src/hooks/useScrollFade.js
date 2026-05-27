import { useEffect, useRef } from 'react'

export function useScrollFade() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    // Observe the element and all .scrolled-fade children
    const targets = [el, ...el.querySelectorAll('.scrolled-fade')]
    targets.forEach(t => {
      t.classList.add('scrolled-fade')
      observer.observe(t)
    })

    return () => observer.disconnect()
  }, [])

  return ref
}
