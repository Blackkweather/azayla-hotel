const STATS = [
  { number: '5', label: 'Unique Room Types' },
  { number: '100m', label: 'From the Atlantic' },
  { number: '14:00', label: 'Check-in / 11:00 Out' },
  { number: '24/7', label: 'At Your Service' },
]

export default function Stats() {
  return (
    <div className="bg-deep-blue flex flex-wrap justify-center">
      {STATS.map((s, i) => (
        <div key={s.label} className="flex flex-col items-center px-10 py-5 relative">
          {i < STATS.length - 1 && (
            <span className="hidden sm:block absolute right-0 top-[15%] h-[70%] w-px bg-white/20" />
          )}
          <span className="font-cormorant text-[2rem] font-bold text-gold leading-none mb-1">
            {s.number}
          </span>
          <span className="text-[0.7rem] text-white/60 uppercase tracking-[1.5px]">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  )
}
