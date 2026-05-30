import { useState } from 'react'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const EMPTY = {
  display_order: 0,
  name: '',
  subtitle: '',
  badge: '',
  guests: 2,
  beds: '',
  price_per_night: '',
  currency: 'MAD',
  description: '',
  images: [],
  amenities: [],
  is_available: true,
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-terracotta transition-colors bg-white'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-terracotta ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Toggle({ value, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-emerald-500' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm text-deep-blue font-medium">{label}</span>
    </label>
  )
}

export default function RoomModal({ room, onSaved, onClose }) {
  const [form, setForm] = useState({ ...EMPTY, ...room })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [newImage, setNewImage] = useState('')
  const [newAmenity, setNewAmenity] = useState('')
  const isEdit = !!room?.id

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function addImage() {
    const v = newImage.trim()
    if (!v) return
    set('images', [...form.images, v])
    setNewImage('')
  }

  function addAmenity() {
    const v = newAmenity.trim()
    if (!v) return
    set('amenities', [...form.amenities, v])
    setNewAmenity('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      price_per_night: form.price_per_night === '' || form.price_per_night === null
        ? null : Number(form.price_per_night),
      guests: Number(form.guests),
      display_order: Number(form.display_order),
    }

    const { id, created_at, updated_at, ...insertPayload } = payload

    let result
    if (isEdit) {
      result = await supabase.from('rooms').update(payload).eq('id', room.id).select().single()
    } else {
      result = await supabase.from('rooms').insert(insertPayload).select().single()
    }

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
    } else {
      onSaved(result.data)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-stretch justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-in panel */}
      <div className="relative z-10 w-full max-w-[480px] bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div>
            <h2 className="font-cormorant text-xl font-semibold text-deep-blue">
              {isEdit ? 'Edit Room' : 'New Room'}
            </h2>
            {isEdit && <p className="text-xs text-gray-400 mt-0.5">{room.name}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-7">

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            {/* ── Basic Info ── */}
            <section>
              <p className="text-[0.65rem] font-black text-gray-300 uppercase tracking-[3px] mb-4">Basic Info</p>
              <div className="space-y-3">
                <Field label="Room Name" required>
                  <input className={inputCls} required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Suite with Terrace" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Subtitle">
                    <input className={inputCls} value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} placeholder="Panoramic Views" />
                  </Field>
                  <Field label="Badge">
                    <input className={inputCls} value={form.badge ?? ''} onChange={e => set('badge', e.target.value)} placeholder="Suite" />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Guests">
                    <input className={inputCls} type="number" min={1} max={20} value={form.guests} onChange={e => set('guests', e.target.value)} />
                  </Field>
                  <Field label="Beds">
                    <input className={inputCls} value={form.beds ?? ''} onChange={e => set('beds', e.target.value)} placeholder="King bed" />
                  </Field>
                  <Field label="Order">
                    <input className={inputCls} type="number" min={0} value={form.display_order} onChange={e => set('display_order', e.target.value)} />
                  </Field>
                </div>
                <Toggle
                  value={form.is_available}
                  onChange={v => set('is_available', v)}
                  label="Visible on website"
                />
              </div>
            </section>

            {/* ── Pricing ── */}
            <section>
              <p className="text-[0.65rem] font-black text-gray-300 uppercase tracking-[3px] mb-4">Pricing</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price / Night">
                  <input className={inputCls} type="number" min={0} step="0.01" value={form.price_per_night ?? ''} onChange={e => set('price_per_night', e.target.value)} placeholder="650" />
                </Field>
                <Field label="Currency">
                  <select className={inputCls} value={form.currency} onChange={e => set('currency', e.target.value)}>
                    <option value="MAD">MAD</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </Field>
              </div>
            </section>

            {/* ── Description ── */}
            <section>
              <p className="text-[0.65rem] font-black text-gray-300 uppercase tracking-[3px] mb-4">Description</p>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                value={form.description ?? ''}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe this room…"
              />
            </section>

            {/* ── Images ── */}
            <section>
              <p className="text-[0.65rem] font-black text-gray-300 uppercase tracking-[3px] mb-4">
                Images <span className="text-gray-400 normal-case tracking-normal font-normal">({form.images.length})</span>
              </p>
              <div className="space-y-2 mb-3">
                {form.images.map((img, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <GripVertical size={14} className="text-gray-300 shrink-0" />
                    <img
                      src={img} alt=""
                      className="w-12 h-9 object-cover rounded bg-gray-200 shrink-0"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                    <span className="flex-1 text-[0.72rem] text-gray-400 font-mono truncate">{img}</span>
                    <button
                      type="button"
                      onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1 text-[0.8rem] font-mono`}
                  value={newImage}
                  onChange={e => setNewImage(e.target.value)}
                  placeholder="/images/rooms/... or https://..."
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
                />
                <button type="button" onClick={addImage} className="px-3 bg-deep-blue hover:bg-deep-blue/90 text-white rounded-lg transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </section>

            {/* ── Amenities ── */}
            <section>
              <p className="text-[0.65rem] font-black text-gray-300 uppercase tracking-[3px] mb-4">
                Amenities <span className="text-gray-400 normal-case tracking-normal font-normal">({form.amenities.length})</span>
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.amenities.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-deep-blue/[0.06] text-deep-blue rounded-full text-xs font-medium">
                    {a}
                    <button
                      type="button"
                      onClick={() => set('amenities', form.amenities.filter((_, j) => j !== i))}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  value={newAmenity}
                  onChange={e => setNewAmenity(e.target.value)}
                  placeholder="Free Wi-Fi"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity() } }}
                />
                <button type="button" onClick={addAmenity} className="px-3 bg-deep-blue hover:bg-deep-blue/90 text-white rounded-lg transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </section>

          </div>

          {/* ── Footer ── */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {saving
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                : isEdit ? 'Save Changes' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
