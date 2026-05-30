import { useState, useRef } from 'react'
import { X, Plus, Trash2, Upload, Camera, Loader2, ImageIcon } from 'lucide-react'
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

const inputCls =
  'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-terracotta transition-colors bg-white'

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

// ── Image uploader ────────────────────────────────────────────────────
function ImageUploader({ onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileRef = useRef(null)
  const cameraRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  async function uploadFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Max 10 MB.')
      return
    }

    setUploading(true)
    setUploadError(null)

    const ext = file.name.split('.').pop().toLowerCase()
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('room-images')
      .upload(safeName, file, { cacheControl: '31536000', upsert: false })

    if (error) {
      setUploadError('Upload failed: ' + error.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('room-images')
      .getPublicUrl(data.path)

    onUploaded(publicUrl)
    setUploading(false)
  }

  function onFileChange(e) {
    uploadFile(e.target.files?.[0])
    e.target.value = ''
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    uploadFile(e.dataTransfer.files?.[0])
  }

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all select-none ${
          dragOver
            ? 'border-terracotta bg-terracotta/5 scale-[1.01]'
            : 'border-gray-200 hover:border-terracotta/60 hover:bg-gray-50'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <Loader2 size={22} className="text-terracotta animate-spin" />
            <p className="text-sm text-gray-500">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <Upload size={22} className="text-gray-300" />
            <p className="text-sm font-medium text-gray-600">
              Drop image here or <span className="text-terracotta">browse</span>
            </p>
            <p className="text-xs text-gray-400">JPG · PNG · WebP · HEIC · max 10 MB</p>
          </div>
        )}
      </div>

      {/* Camera button — shown on all devices, essential on mobile */}
      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:border-terracotta/40 transition-colors disabled:opacity-40"
      >
        <Camera size={15} className="text-terracotta" />
        Take a photo with camera
      </button>

      {uploadError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X size={11} /> {uploadError}
        </p>
      )}

      {/* Hidden inputs */}
      <input ref={fileRef}   type="file" accept="image/*"           className="hidden" onChange={onFileChange} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────
export default function RoomModal({ room, onSaved, onClose }) {
  const [form, setForm] = useState({ ...EMPTY, ...room })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [newAmenity, setNewAmenity] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const isEdit = !!room?.id

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function addImageUrl() {
    const v = urlInput.trim()
    if (!v) return
    set('images', [...form.images, v])
    setUrlInput('')
  }

  function addAmenity() {
    const v = newAmenity.trim()
    if (!v) return
    set('amenities', [...form.amenities, v])
    setNewAmenity('')
  }

  function removeImage(i) {
    set('images', form.images.filter((_, j) => j !== i))
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — full width on mobile, 480px on desktop */}
      <div className="relative z-10 w-full sm:max-w-[480px] bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shrink-0">
          <div>
            <h2 className="font-cormorant text-xl font-semibold text-deep-blue">
              {isEdit ? 'Edit Room' : 'New Room'}
            </h2>
            {isEdit && <p className="text-xs text-gray-400 mt-0.5">{room.name}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 py-5 space-y-7">

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
                <Toggle value={form.is_available} onChange={v => set('is_available', v)} label="Visible on website" />
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
                Photos <span className="text-gray-400 normal-case tracking-normal font-normal">({form.images.length})</span>
              </p>

              {/* Upload widget */}
              <div className="mb-4">
                <ImageUploader onUploaded={url => set('images', [...form.images, url])} />
              </div>

              {/* Existing images */}
              {form.images.length > 0 && (
                <div className="space-y-2 mb-3">
                  {form.images.map((img, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      {img.startsWith('http') || img.startsWith('/') ? (
                        <img
                          src={img} alt=""
                          className="w-14 h-10 object-cover rounded-lg bg-gray-200 shrink-0"
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                          <ImageIcon size={14} className="text-gray-400" />
                        </div>
                      )}
                      <span className="flex-1 text-[0.7rem] text-gray-400 font-mono truncate">{img}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Manual URL fallback */}
              <div>
                <p className="text-[0.65rem] text-gray-300 uppercase tracking-widest mb-2">Or paste a URL</p>
                <div className="flex gap-2">
                  <input
                    className={`${inputCls} flex-1 text-[0.8rem] font-mono`}
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl() } }}
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-3.5 bg-deep-blue hover:bg-deep-blue/90 text-white rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
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
                  placeholder="e.g. Free Wi-Fi"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity() } }}
                />
                <button type="button" onClick={addAmenity} className="px-3.5 bg-deep-blue hover:bg-deep-blue/90 text-white rounded-lg transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </section>

          </div>

          {/* ── Footer ── */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              {saving
                ? <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />Saving…
                  </span>
                : isEdit ? 'Save Changes' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
