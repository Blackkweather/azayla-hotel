import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, LogOut, ExternalLink, BedDouble, Users, LayoutGrid } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import RoomModal from './RoomModal'

export default function AdminDashboard({ session }) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function fetchRooms() {
    const { data } = await supabase.from('rooms').select('*').order('display_order')
    setRooms(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchRooms() }, [])

  async function handleToggle(room) {
    setTogglingId(room.id)
    const { data } = await supabase
      .from('rooms').update({ is_available: !room.is_available })
      .eq('id', room.id).select().single()
    if (data) setRooms(prev => prev.map(r => r.id === room.id ? data : r))
    setTogglingId(null)
  }

  async function handleDelete(room) {
    if (!window.confirm(`Delete "${room.name}"? This cannot be undone.`)) return
    setDeletingId(room.id)
    await supabase.from('rooms').delete().eq('id', room.id)
    setRooms(prev => prev.filter(r => r.id !== room.id))
    setDeletingId(null)
  }

  function openAdd() { setEditingRoom(null); setModalOpen(true) }
  function openEdit(room) { setEditingRoom(room); setModalOpen(true) }
  function handleSaved(saved) {
    setRooms(prev => {
      const idx = prev.findIndex(r => r.id === saved.id)
      const next = idx >= 0
        ? prev.map(r => r.id === saved.id ? saved : r)
        : [...prev, saved]
      return next.sort((a, b) => a.display_order - b.display_order)
    })
    setModalOpen(false)
  }

  const availableCount = rooms.filter(r => r.is_available).length

  return (
    <div className="min-h-screen bg-[#f7f6f3] pb-24 sm:pb-0">

      {/* ── Top bar ── */}
      <header className="bg-deep-blue shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">

          {/* Left: logo + title */}
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo-removebg-preview.png" alt="Azayla" className="h-10 sm:h-14 w-auto brightness-0 invert shrink-0" />
            <div className="border-l border-white/10 pl-3 min-w-0">
              <p className="font-cormorant text-white text-base sm:text-lg font-semibold leading-none">Dashboard</p>
              <p className="text-white/40 text-[0.65rem] mt-0.5 truncate hidden sm:block">{session.user.email}</p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white/50 hover:text-white/90 text-xs transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">View site</span>
            </a>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-1.5 px-3 py-2 border border-white/15 hover:border-white/30 rounded-lg text-white/60 hover:text-white text-xs transition-colors"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: 'Total Rooms', value: rooms.length,                  color: 'text-deep-blue' },
            { label: 'Live',        value: availableCount,                color: 'text-emerald-600' },
            { label: 'Hidden',      value: rooms.length - availableCount, color: 'text-terracotta' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-7 py-4 sm:py-5">
              <p className="text-[0.6rem] sm:text-xs text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`font-cormorant text-4xl sm:text-5xl font-bold ${s.color} leading-none`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Section header ── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-cormorant text-xl sm:text-2xl font-bold text-deep-blue flex items-center gap-2">
              <LayoutGrid size={18} className="text-terracotta" />
              Room Catalog
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Tap a card to edit · changes go live instantly</p>
          </div>
          {/* Desktop add button */}
          <button
            onClick={openAdd}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={15} />
            Add Room
          </button>
        </div>

        {/* ── Room grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No rooms yet</p>
            <p className="text-sm">Tap "Add Room" to create your first room.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {rooms.map(room => (
              <div
                key={room.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-200 ${
                  room.is_available
                    ? 'border-gray-100 hover:shadow-md'
                    : 'border-dashed border-gray-200 opacity-60'
                }`}
              >
                {/* Cover image */}
                <div className="relative h-44 sm:h-48 bg-gray-100 cursor-pointer group active:scale-[0.99] transition-transform" onClick={() => openEdit(room)}>
                  {room.images?.[0]
                    ? <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No image</div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wide ${
                    room.is_available ? 'bg-emerald-500 text-white' : 'bg-gray-800/70 text-gray-300'
                  }`}>
                    {room.is_available ? 'Live' : 'Hidden'}
                  </span>

                  <span className="absolute bottom-3 right-3 bg-black/50 text-white text-[0.65rem] px-2 py-1 rounded-full">
                    {room.images?.length ?? 0} photos
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className="font-cormorant text-[1.1rem] sm:text-[1.15rem] font-semibold text-deep-blue leading-tight cursor-pointer hover:text-terracotta transition-colors"
                      onClick={() => openEdit(room)}
                    >
                      {room.name}
                    </h3>
                    <span className="text-sm font-bold text-terracotta whitespace-nowrap shrink-0">
                      {room.price_per_night
                        ? `${Number(room.price_per_night).toLocaleString('fr-MA')} ${room.currency}`
                        : '—'}
                    </span>
                  </div>

                  <p className="text-[0.65rem] text-terracotta/80 uppercase tracking-wider mb-2">{room.subtitle}</p>

                  <div className="flex gap-4 mb-3">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <BedDouble size={11} className="text-gray-300" /> {room.beds || '—'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Users size={11} className="text-gray-300" /> {room.guests} guests
                    </span>
                  </div>

                  {room.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4">{room.description}</p>
                  )}

                  {/* Actions — bigger touch targets on mobile */}
                  <div className="flex gap-2 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => openEdit(room)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 rounded-xl bg-deep-blue/5 hover:bg-deep-blue/10 active:bg-deep-blue/15 text-deep-blue text-xs font-semibold transition-colors"
                    >
                      <Edit2 size={13} /> Edit
                    </button>

                    <button
                      onClick={() => handleToggle(room)}
                      disabled={togglingId === room.id}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 ${
                        room.is_available
                          ? 'bg-orange-50 hover:bg-orange-100 active:bg-orange-200 text-orange-600'
                          : 'bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-600'
                      }`}
                    >
                      {room.is_available
                        ? <><EyeOff size={13} /> Hide</>
                        : <><Eye size={13} /> Show</>
                      }
                    </button>

                    <button
                      onClick={() => handleDelete(room)}
                      disabled={deletingId === room.id}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Mobile floating Add button ── */}
      <button
        onClick={openAdd}
        className="sm:hidden fixed bottom-6 right-5 w-14 h-14 bg-terracotta hover:bg-terracotta/90 active:scale-95 text-white rounded-full shadow-xl flex items-center justify-center transition-all z-40"
        aria-label="Add Room"
      >
        <Plus size={24} />
      </button>

      {modalOpen && (
        <RoomModal
          room={editingRoom}
          onSaved={handleSaved}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
