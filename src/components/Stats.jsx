import { useT } from '@/hooks/useT'

export default function Stats() {
  const t = useT()

  const STATS = [
    { number: '5',     key: 'stats.rooms' },
    { number: '100m',  key: 'stats.beach' },
    { number: '14:00', key: 'stats.checkin' },
    { number: '24/7',  key: 'stats.service' },
  ]

  return (
    <div className="bg-deep-blue flex flex-wrap justify-center w-full overflow-hidden">
      {STATS.map((s, i) => (
        <div key={s.key} className="flex flex-col items-center px-5 sm:px-10 py-4 sm:py-5 relative">
          {i < STATS.length - 1 && (
            <span className="hidden sm:block absolute right-0 top-[15%] h-[70%] w-px bg-white/20" />
          )}
          <span className="font-cormorant text-[2rem] font-bold text-gold leading-none mb-1">
            {s.number}
          </span>
          <span className="text-[0.7rem] text-white/60 uppercase tracking-[1.5px]">
            {t(s.key)}
          </span>
        </div>
      ))}
    </div>
  )
}
