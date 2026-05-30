import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

function ymd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseYmd(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

/** Build a Set of every occupied date from confirmed/pending booking ranges */
function buildOccupied(bookedRanges = []) {
  const set = new Set()
  for (const { check_in, check_out } of bookedRanges) {
    let cur = parseYmd(check_in)
    const end = parseYmd(check_out)
    while (cur < end) {
      set.add(ymd(cur))
      cur = addDays(cur, 1)
    }
  }
  return set
}

// ─────────────────────────────────────────────────────────────────────────────
// CalendarPicker
// Props:
//   checkIn  {string|null}  – 'YYYY-MM-DD'
//   checkOut {string|null}
//   onChange {fn}           – called with { checkIn, checkOut }
//   bookedRanges {Array}    – [{check_in, check_out}]
// ─────────────────────────────────────────────────────────────────────────────
export default function CalendarPicker({ checkIn, checkOut, onChange, bookedRanges = [] }) {
  const todayDate  = new Date(); todayDate.setHours(0,0,0,0)
  const todayStr   = ymd(todayDate)

  const initDate   = checkIn ? parseYmd(checkIn) : todayDate
  const [yr, setYr]    = useState(initDate.getFullYear())
  const [mo, setMo]    = useState(initDate.getMonth())
  const [hovered, setHovered] = useState(null)  // dateStr being hovered
  const [picking, setPicking]  = useState(checkIn && !checkOut ? 'end' : 'start')

  const occupied = buildOccupied(bookedRanges)

  // ── Navigation ────────────────────────────────────────────────────────
  function prev() {
    if (mo === 0) { setMo(11); setYr(y => y - 1) }
    else setMo(m => m - 1)
  }
  function next() {
    if (mo === 11) { setMo(0); setYr(y => y + 1) }
    else setMo(m => m + 1)
  }

  const canPrev = yr > todayDate.getFullYear() ||
    (yr === todayDate.getFullYear() && mo > todayDate.getMonth())

  // ── Selection logic ───────────────────────────────────────────────────
  function handleClick(dateStr) {
    if (isDisabled(dateStr)) return

    if (picking === 'start') {
      onChange({ checkIn: dateStr, checkOut: null })
      setPicking('end')
    } else {
      // picking end
      if (dateStr <= checkIn) {
        // Clicked on or before start → restart
        onChange({ checkIn: dateStr, checkOut: null })
        setPicking('end')
      } else {
        // Check no booked dates in range
        if (hasBlockedInRange(checkIn, dateStr)) return
        onChange({ checkIn, checkOut: dateStr })
        setPicking('start')
      }
    }
    setHovered(null)
  }

  function handleHover(dateStr) {
    if (picking === 'end' && checkIn) setHovered(dateStr)
  }

  /** True if any day in (start, end) is occupied */
  function hasBlockedInRange(start, end) {
    let d = parseYmd(start)
    const e = parseYmd(end)
    d = addDays(d, 1) // start is check-in, not blocked
    while (d < e) {
      if (occupied.has(ymd(d))) return true
      d = addDays(d, 1)
    }
    return false
  }

  function isDisabled(dateStr) {
    return dateStr < todayStr || occupied.has(dateStr)
  }

  // Preview range end (hovered or confirmed checkout)
  const rangeEnd = picking === 'end' ? (hovered || checkOut) : checkOut

  // ── Build grid ────────────────────────────────────────────────────────
  const daysInMonth   = new Date(yr, mo + 1, 0).getDate()
  const firstWeekday  = new Date(yr, mo, 1).getDay()
  const cells = Array(firstWeekday).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="select-none" onMouseLeave={() => setHovered(null)}>

      {/* ── Month header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={prev}
          disabled={!canPrev}
          className="w-9 h-9 flex items-center justify-center rounded-full text-deep-blue hover:bg-deep-blue/6 disabled:opacity-20 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <h3 className="font-cormorant text-[1.35rem] font-semibold text-deep-blue tracking-wide">
          {MONTHS[mo]} {yr}
        </h3>

        <button
          type="button"
          onClick={next}
          className="w-9 h-9 flex items-center justify-center rounded-full text-deep-blue hover:bg-deep-blue/6 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── Gold ornament ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-px bg-gold/25" />
        <div className="w-1 h-1 rounded-full bg-gold/60" />
        <div className="flex-1 h-px bg-gold/25" />
      </div>

      {/* ── Day name headers ─────────────────────────────────────────── */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[0.62rem] font-bold text-gold/70 uppercase tracking-[0.1em] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* ── Days grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`_${idx}`} />

          const mo2  = String(mo + 1).padStart(2, '0')
          const day2 = String(day).padStart(2, '0')
          const ds   = `${yr}-${mo2}-${day2}`

          const disabled   = isDisabled(ds)
          const isPast     = ds < todayStr
          const isBooked   = occupied.has(ds)
          const isToday    = ds === todayStr
          const isStart    = ds === checkIn
          const isEnd      = ds === checkOut
          const isHoverEnd = ds === hovered && picking === 'end' && checkIn && ds > checkIn
          const inRange    = checkIn && rangeEnd && ds > checkIn && ds < rangeEnd && !isDisabled(ds)
          const blockedInHoverRange = picking === 'end' && checkIn && hovered &&
            ds > checkIn && ds < hovered && occupied.has(ds)

          // Half-backgrounds for continuous range bar
          const bgLeft  = (isEnd || (isHoverEnd && !isEnd)) && checkIn
          const bgRight = isStart && rangeEnd && checkIn < rangeEnd

          return (
            <div
              key={day}
              className={`relative h-10 flex items-center justify-center ${
                inRange ? 'bg-terracotta/8' :
                blockedInHoverRange ? 'bg-red-50/60' : ''
              }`}
            >
              {/* Half-bg strip for start → range / range → end */}
              {bgRight && (
                <span className="absolute inset-y-0 right-0 w-1/2 bg-terracotta/8 pointer-events-none" />
              )}
              {bgLeft && (
                <span className="absolute inset-y-0 left-0 w-1/2 bg-terracotta/8 pointer-events-none" />
              )}

              <button
                type="button"
                disabled={disabled}
                onClick={() => handleClick(ds)}
                onMouseEnter={() => handleHover(ds)}
                title={isBooked ? 'Already booked' : undefined}
                className={[
                  'relative z-10 w-8 h-8 rounded-full text-sm font-medium transition-all',
                  // Selected start or end
                  isStart || isEnd
                    ? 'bg-terracotta text-white shadow-md ring-2 ring-terracotta/30 scale-105'
                    : '',
                  // Hover preview of end date
                  isHoverEnd && !isEnd
                    ? 'bg-terracotta/60 text-white'
                    : '',
                  // Normal interactive
                  !isStart && !isEnd && !isHoverEnd && !disabled
                    ? 'hover:bg-terracotta/12 text-deep-blue cursor-pointer'
                    : '',
                  // Past dates
                  isPast && !isStart && !isEnd
                    ? 'text-gray-300 cursor-not-allowed'
                    : '',
                  // Booked dates
                  isBooked
                    ? 'text-gray-300 cursor-not-allowed line-through decoration-gray-300/60'
                    : '',
                ].filter(Boolean).join(' ')}
              >
                {day}
                {/* Gold dot = today */}
                {isToday && !isStart && !isEnd && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Status hint ──────────────────────────────────────────────── */}
      <div className="mt-5 flex items-center justify-center gap-2 min-h-5">
        {!checkIn && (
          <p className="text-xs text-gray-400 italic">Tap a date to begin</p>
        )}
        {checkIn && !checkOut && (
          <p className="text-xs text-gray-400 italic">Now select your check-out date</p>
        )}
        {checkIn && checkOut && (
          <p className="text-xs text-deep-blue/70 font-medium">
            {fmtShort(checkIn)} → {fmtShort(checkOut)}
          </p>
        )}
      </div>

      {/* ── Legend ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-5 mt-3">
        <span className="flex items-center gap-1.5 text-[0.62rem] text-gray-400">
          <span className="w-3 h-3 rounded-full bg-terracotta inline-block" />
          Selected
        </span>
        <span className="flex items-center gap-1.5 text-[0.62rem] text-gray-400">
          <span className="w-3 h-3 rounded-full bg-gray-200 inline-block line-through" />
          Booked
        </span>
        <span className="flex items-center gap-1.5 text-[0.62rem] text-gray-400">
          <span className="relative w-3 h-3 inline-block">
            <span className="absolute inset-0 rounded-full border border-gold/60" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
          </span>
          Today
        </span>
      </div>
    </div>
  )
}

function fmtShort(str) {
  return new Date(str + 'T12:00:00')
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
