import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'medina', label: 'Medina' },
  { value: 'port', label: 'Port' },
  { value: 'beach', label: 'Beach' },
  { value: 'lixus', label: 'Lixus' },
  { value: 'tangier', label: 'Tangier' },
]

const IMAGES = [
  { src: '/images/attractions/asilah-medina/9.jpg', alt: 'Whitewashed walls of Asilah Medina', cat: 'medina' },
  { src: '/images/attractions/asilah-medina/mm.jpg', alt: 'Blue doors of Asilah Medina', cat: 'medina' },
  { src: '/images/attractions/asilah-medina/t.jpg', alt: 'Street art murals in Asilah', cat: 'medina' },
  { src: '/images/attractions/asilah-medina/tt.jpg', alt: 'Asilah Medina alleyway', cat: 'medina' },
  { src: '/images/attractions/asilah-medina/x.webp', alt: 'Asilah old city ramparts', cat: 'medina' },
  { src: '/images/attractions/asilah-port/ac.jpeg', alt: 'Fishing boats at Asilah Port', cat: 'port' },
  { src: '/images/attractions/asilah-port/b.webp', alt: 'Asilah harbour at dusk', cat: 'port' },
  { src: '/images/attractions/asilah-port/h.jpeg', alt: 'Atlantic coastline near Asilah port', cat: 'port' },
  { src: '/images/attractions/asilah-port/m.jpeg', alt: 'Asilah port panorama', cat: 'port' },
  { src: '/images/attractions/lixus-archaeological-site/ruinas_de_lixus-1536x962.jpg', alt: 'Ruins of ancient Lixus', cat: 'lixus' },
  { src: '/images/attractions/lixus-archaeological-site/bb.webp', alt: 'Lixus Roman ruins', cat: 'lixus' },
  { src: '/images/attractions/lixus-archaeological-site/cv.webp', alt: 'Lixus archaeological site', cat: 'lixus' },
  { src: '/images/attractions/lixus-archaeological-site/kk.webp', alt: 'Ancient columns at Lixus', cat: 'lixus' },
  { src: '/images/attractions/tangier/hrc.jpg', alt: 'Tangier medina view', cat: 'tangier' },
  { src: '/images/attractions/tangier/ll.jpg', alt: 'Tangier coastal skyline', cat: 'tangier' },
  { src: '/images/attractions/tangier/ma.jpg', alt: 'Streets of Tangier', cat: 'tangier' },
  { src: '/images/attractions/tangier/md.jpg', alt: 'Tangier harbour at sunset', cat: 'tangier' },
  { src: '/images/attractions/tangier/mr.avif', alt: 'Tangier city panorama', cat: 'tangier' },
  { src: '/images/attractions/tangier/Ancien Medina .jpg', alt: "Tangier's ancient medina streets", cat: 'tangier' },
  { src: '/images/attractions/tangier/grotte hercules .jpg', alt: "Grottes d'Hercule near Tangier", cat: 'tangier' },
  { src: '/images/attractions/plage-de-asilah/whatsapp-image-2026-05-19-at-07.32.08.jpeg', alt: 'Plage de Asilah golden sands', cat: 'beach' },
  { src: '/images/attractions/plage-de-asilah/whatsapp-image-2026-05-19-at-07.32.09.jpeg', alt: 'Atlantic waves at Asilah beach', cat: 'beach' },
  { src: '/images/attractions/plage-de-asilah/whatsapp-image-2026-05-19-at-07.36.24.jpeg', alt: 'Asilah beach sunrise', cat: 'beach' },
  { src: '/images/attractions/plage-de-asilah/whatsapp-image-2026-05-19-at-07.36.38.jpeg', alt: 'Asilah beach promenade', cat: 'beach' },
  { src: '/images/attractions/Asilah Beaches/Playa Asilah .jpeg', alt: 'Playa Asilah coastline', cat: 'beach' },
  { src: '/images/attractions/Asilah Beaches/Rmilat beach.jpeg', alt: 'Rmilat beach near Asilah', cat: 'beach' },
  { src: '/images/attractions/Asilah Beaches/Sidi Mghayet Beach.jpeg', alt: 'Sidi Mghayet Beach', cat: 'beach' },
  { src: '/images/attractions/Asilah Beaches/Camel tour .jpeg', alt: 'Camel tour on Asilah beach', cat: 'beach' },
]

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null)

  return (
    <section id="gallery" className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12 section-underline">
        <h2 className="font-cormorant text-[2.8rem] text-deep-blue">Gallery</h2>
      </div>

      <Tabs.Root defaultValue="all">
        {/* Filter tabs */}
        <Tabs.List className="flex flex-wrap justify-center gap-2 mb-10" aria-label="Filter gallery">
          {CATEGORIES.map(cat => (
            <Tabs.Trigger
              key={cat.value}
              value={cat.value}
              className={cn(
                'px-5 py-2 rounded-full border-2 text-sm font-semibold transition-all cursor-pointer',
                'border-gray-200 text-gray-500 bg-transparent',
                'hover:border-terracotta hover:text-terracotta',
                'data-[state=active]:bg-terracotta data-[state=active]:border-terracotta data-[state=active]:text-white'
              )}
            >
              {cat.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* All-images pane */}
        <Tabs.Content value="all">
          <PhotoGrid images={IMAGES} onOpen={setLightbox} />
        </Tabs.Content>

        {/* Per-category panes */}
        {CATEGORIES.slice(1).map(cat => (
          <Tabs.Content key={cat.value} value={cat.value}>
            <PhotoGrid images={IMAGES.filter(i => i.cat === cat.value)} onOpen={setLightbox} />
          </Tabs.Content>
        ))}
      </Tabs.Root>

      {/* Lightbox */}
      <Dialog.Root open={!!lightbox} onOpenChange={open => !open && setLightbox(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/95 z-[2000] animate-[fadeIn_0.2s_ease]" />
          <Dialog.Content
            className="fixed inset-0 z-[2001] flex items-center justify-center p-4 outline-none"
            onKeyDown={e => {
              if (!lightbox) return
              const idx = IMAGES.findIndex(i => i.src === lightbox.src)
              if (e.key === 'ArrowRight') setLightbox(IMAGES[(idx + 1) % IMAGES.length])
              if (e.key === 'ArrowLeft') setLightbox(IMAGES[(idx - 1 + IMAGES.length) % IMAGES.length])
            }}
          >
            <Dialog.Title className="sr-only">{lightbox?.alt}</Dialog.Title>
            {lightbox && (
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="max-w-[92vw] max-h-[88vh] object-contain rounded-md shadow-2xl"
              />
            )}
            <Dialog.Close className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <X size={24} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  )
}

function PhotoGrid({ images, onOpen }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {images.map(img => (
        <button
          key={img.src}
          onClick={() => onOpen(img)}
          className="aspect-square rounded-xl overflow-hidden cursor-zoom-in group outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </button>
      ))}
    </div>
  )
}
