import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import * as Dialog from '@radix-ui/react-dialog'
import { X, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserLanguage } from '@/hooks/useUserLanguage'
import { useT } from '@/hooks/useT'

const CATEGORIES = [
  { value: 'all',     key: 'gallery.cat.all' },
  { value: 'medina',  key: 'gallery.cat.medina' },
  { value: 'port',    key: 'gallery.cat.port' },
  { value: 'beach',   key: 'gallery.cat.beach' },
  { value: 'lixus',   key: 'gallery.cat.lixus' },
  { value: 'tangier', key: 'gallery.cat.tangier' },
]

const IMAGES = [
  {
    src: '/images/attractions/asilah-medina/9.jpg',
    alt: 'Evening souk lane lined with craft shops below the Kasba tower',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Medina+Asilah+Morocco',
    cat: 'medina',
    location: {
      en: 'Asilah Medina, Asilah',
      fr: "Médina d'Asilah",
      ar: 'مدينة أصيلة',
      es: 'Medina de Asilah',
      nl: 'Medina van Asilah',
      de: 'Medina von Asilah',
      it: 'Medina di Asilah',
      pt: 'Medina de Asilah',
    },
  },
  {
    src: '/images/attractions/asilah-medina/mm.jpg',
    alt: 'Ancient sea ramparts of Asilah meeting the Atlantic at sunset',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Medina+Asilah+Morocco',
    cat: 'medina',
    location: {
      en: 'Asilah Medina, Asilah',
      fr: "Médina d'Asilah",
      ar: 'مدينة أصيلة',
      es: 'Medina de Asilah',
      nl: 'Medina van Asilah',
      de: 'Medina von Asilah',
      it: 'Medina di Asilah',
      pt: 'Medina de Asilah',
    },
  },
  {
    src: '/images/attractions/asilah-medina/t.jpg',
    alt: 'Iconic blue ocean mural framing a decorated Moorish doorway',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Medina+Asilah+Morocco',
    cat: 'medina',
    location: {
      en: 'Asilah Medina, Asilah',
      fr: "Médina d'Asilah",
      ar: 'مدينة أصيلة',
      es: 'Medina de Asilah',
      nl: 'Medina van Asilah',
      de: 'Medina von Asilah',
      it: 'Medina di Asilah',
      pt: 'Medina de Asilah',
    },
  },
  {
    src: '/images/attractions/asilah-medina/tt.jpg',
    alt: 'White crenellated rampart wall overlooking the open Atlantic',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Medina+Asilah+Morocco',
    cat: 'medina',
    location: {
      en: 'Asilah Medina, Asilah',
      fr: "Médina d'Asilah",
      ar: 'مدينة أصيلة',
      es: 'Medina de Asilah',
      nl: 'Medina van Asilah',
      de: 'Medina von Asilah',
      it: 'Medina di Asilah',
      pt: 'Medina de Asilah',
    },
  },
  {
    src: '/images/attractions/asilah-medina/x.webp',
    alt: 'Sunlit medina alley with blue doors, potted plants and a resting cat',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Medina+Asilah+Morocco',
    cat: 'medina',
    location: {
      en: 'Asilah Medina, Asilah',
      fr: "Médina d'Asilah",
      ar: 'مدينة أصيلة',
      es: 'Medina de Asilah',
      nl: 'Medina van Asilah',
      de: 'Medina von Asilah',
      it: 'Medina di Asilah',
      pt: 'Medina de Asilah',
    },
  },
  {
    src: '/images/attractions/asilah-port/ac.jpeg',
    alt: "Monumental arched entrance gate of Port d'Asilah at dusk",
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Port+Asilah+Morocco',
    cat: 'port',
    location: {
      en: "Port d'Asilah, Avenue Mohammed V",
      fr: "Port d'Asilah, Avenue Mohammed V",
      ar: 'ميناء أصيلة، شارع محمد الخامس',
      es: 'Puerto de Asilah, Avenida Mohammed V',
      nl: 'Haven van Asilah, Avenue Mohammed V',
      de: 'Hafen von Asilah, Avenue Mohammed V',
      it: 'Porto di Asilah, Avenue Mohammed V',
      pt: 'Porto de Asilah, Avenida Mohammed V',
    },
  },
  {
    src: '/images/attractions/asilah-port/b.webp',
    alt: 'Rows of concrete tetrapods along the port breakwater with crashing Atlantic waves',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Jetee+Port+Asilah+Morocco',
    cat: 'port',
    location: {
      en: "Port d'Asilah Breakwater",
      fr: "Jetée du Port d'Asilah",
      ar: 'رصيف ميناء أصيلة',
      es: 'Rompeolas del Puerto de Asilah',
      nl: 'Golfbreker Haven Asilah',
      de: 'Wellenbrecher Hafen Asilah',
      it: 'Frangiflutti del Porto di Asilah',
      pt: 'Quebra-mar do Porto de Asilah',
    },
  },
  {
    src: '/images/attractions/asilah-port/h.jpeg',
    alt: 'Man in a djellaba standing on the jetty with the Asilah medina skyline behind',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Port+Asilah+jetty+Morocco',
    cat: 'port',
    location: {
      en: "Port d'Asilah Breakwater",
      fr: "Jetée du Port d'Asilah",
      ar: 'رصيف ميناء أصيلة',
      es: 'Muelle del Puerto de Asilah',
      nl: 'Havenpier van Asilah',
      de: 'Hafenpier von Asilah',
      it: 'Molo del Porto di Asilah',
      pt: 'Cais do Porto de Asilah',
    },
  },
  {
    src: '/images/attractions/asilah-port/m.jpeg',
    alt: 'Blue fishing boats moored in the harbour under a vivid Atlantic sunset',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Port+de+peche+Asilah+Morocco',
    cat: 'port',
    location: {
      en: 'Asilah Fishing Harbour',
      fr: "Port de Pêche d'Asilah",
      ar: 'ميناء الصيد بأصيلة',
      es: 'Puerto Pesquero de Asilah',
      nl: 'Vissershaven van Asilah',
      de: 'Fischerhafen von Asilah',
      it: 'Porto Peschereccio di Asilah',
      pt: 'Porto de Pesca de Asilah',
    },
  },
  {
    src: '/images/attractions/lixus-archaeological-site/ruinas_de_lixus-1536x962.jpg',
    alt: 'Rows of standing Roman columns amid green grass at the Lixus temple precinct',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Temple+Lixus+Larache+Morocco',
    cat: 'lixus',
    location: {
      en: 'Temple of Lixus, Larache',
      fr: 'Temple de Lixus, Larache',
      ar: 'معبد ليكسوس، العرائش',
      es: 'Templo de Lixus, Larache',
      nl: 'Tempel van Lixus, Larache',
      de: 'Tempel von Lixus, Larache',
      it: 'Tempio di Lixus, Larache',
      pt: 'Templo de Lixus, Larache',
    },
  },
  {
    src: '/images/attractions/lixus-archaeological-site/bb.webp',
    alt: 'Excavated circular garum fish-salting tanks from the Roman era',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Lixus+garum+factory+Larache+Morocco',
    cat: 'lixus',
    location: {
      en: 'Garum Factory, Lixus, Larache',
      fr: 'Usine de Garum, Lixus, Larache',
      ar: 'مصنع الغاروم، ليكسوس، العرائش',
      es: 'Fábrica de Garum, Lixus, Larache',
      nl: 'Garumfabriek, Lixus, Larache',
      de: 'Garum-Fabrik, Lixus, Larache',
      it: 'Fabbrica di Garum, Lixus, Larache',
      pt: 'Fábrica de Garum, Lixus, Larache',
    },
  },
  {
    src: '/images/attractions/lixus-archaeological-site/cv.webp',
    alt: 'Vaulted Roman brick archways inside the Lixus bath complex',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Lixus+Roman+baths+Larache+Morocco',
    cat: 'lixus',
    location: {
      en: 'Roman Baths of Lixus, Larache',
      fr: 'Thermes Romains de Lixus, Larache',
      ar: 'الحمامات الرومانية، ليكسوس، العرائش',
      es: 'Termas Romanas de Lixus, Larache',
      nl: 'Romeinse Baden van Lixus, Larache',
      de: 'Römische Thermen von Lixus, Larache',
      it: 'Terme Romane di Lixus, Larache',
      pt: 'Termas Romanas de Lixus, Larache',
    },
  },
  {
    src: '/images/attractions/lixus-archaeological-site/kk.webp',
    alt: 'Panoramic view of Lixus ruins with cypress trees and the Loukkos River estuary',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Lixus+acropolis+Larache+Morocco',
    cat: 'lixus',
    location: {
      en: 'Lixus Acropolis, Larache',
      fr: 'Acropole de Lixus, Larache',
      ar: 'أكروبول ليكسوس، العرائش',
      es: 'Acrópolis de Lixus, Larache',
      nl: 'Acropolis van Lixus, Larache',
      de: 'Akropolis von Lixus, Larache',
      it: 'Acropoli di Lixus, Larache',
      pt: 'Acrópole de Lixus, Larache',
    },
  },
  {
    src: '/images/attractions/tangier/ma.jpg',
    alt: 'Viewpoint sign marking where the Mediterranean Sea meets the Atlantic Ocean',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Cap+Spartel+Tangier+Morocco',
    cat: 'tangier',
    location: {
      en: 'Cap Spartel, Tangier',
      fr: 'Cap Spartel, Tanger',
      ar: 'كاب سبارتيل، طنجة',
      es: 'Cabo Espartel, Tánger',
      nl: 'Kaap Spartel, Tanger',
      de: 'Kap Spartel, Tanger',
      it: 'Capo Spartel, Tangeri',
      pt: 'Cabo Espartel, Tânger',
    },
  },
  {
    src: '/images/attractions/tangier/md.jpg',
    alt: "Night aerial view of Tangier's illuminated seafront boulevard and beach",
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Corniche+Tanger+Morocco',
    cat: 'tangier',
    location: {
      en: 'Corniche de Tanger, Tangier',
      fr: 'Corniche de Tanger',
      ar: 'كورنيش طنجة',
      es: 'Corniche de Tánger',
      nl: 'Corniche van Tanger',
      de: 'Corniche von Tanger',
      it: 'Corniche di Tangeri',
      pt: 'Corniche de Tânger',
    },
  },
  {
    src: '/images/attractions/tangier/mr.avif',
    alt: 'Tangier city panorama over the rooftops',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Tangier+Morocco',
    cat: 'tangier',
    location: {
      en: 'Tangier, Morocco',
      fr: 'Tanger, Maroc',
      ar: 'طنجة، المغرب',
      es: 'Tánger, Marruecos',
      nl: 'Tanger, Marokko',
      de: 'Tanger, Marokko',
      it: 'Tangeri, Marocco',
      pt: 'Tânger, Marrocos',
    },
  },
  {
    src: '/images/attractions/tangier/Ancien-Medina.jpg',
    alt: 'Ancient medina walls and whitewashed buildings with palm trees',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ancienne+Medina+Tanger+Morocco',
    cat: 'tangier',
    location: {
      en: 'Ancienne Médina de Tanger',
      fr: 'Ancienne Médina de Tanger',
      ar: 'المدينة القديمة، طنجة',
      es: 'Antigua Medina de Tánger',
      nl: 'Oude Medina van Tanger',
      de: 'Altstadt-Medina von Tanger',
      it: 'Medina Antica di Tangeri',
      pt: 'Medina Antiga de Tânger',
    },
  },
  {
    src: '/images/attractions/tangier/grotte-hercules.jpg',
    alt: 'Natural cave opening framing the turquoise Atlantic at the Caves of Hercules',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Grottes+Hercule+Cap+Spartel+Tangier+Morocco',
    cat: 'tangier',
    location: {
      en: "Caves of Hercules, Cap Spartel, Tangier",
      fr: "Grottes d'Hercule, Cap Spartel, Tanger",
      ar: 'مغارة هرقل، كاب سبارتيل، طنجة',
      es: 'Cuevas de Hércules, Cabo Espartel, Tánger',
      nl: 'Grotten van Hercules, Kaap Spartel, Tanger',
      de: 'Herkules-Grotten, Kap Spartel, Tanger',
      it: 'Grotte di Ercole, Capo Spartel, Tangeri',
      pt: 'Grutas de Hércules, Cabo Espartel, Tânger',
    },
  },
  {
    src: '/images/attractions/asilah-beaches/Playa-Asilah.jpeg',
    alt: "Aerial view of Asilah's wide golden sandy beach stretching along the Atlantic",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Plage+Asilah+Morocco",
    cat: 'beach',
    location: {
      en: "Plage d'Asilah, Asilah",
      fr: "Plage d'Asilah",
      ar: 'شاطئ أصيلة',
      es: 'Playa de Asilah',
      nl: 'Strand van Asilah',
      de: 'Strand von Asilah',
      it: 'Spiaggia di Asilah',
      pt: 'Praia de Asilah',
    },
  },
  {
    src: '/images/attractions/asilah-beaches/Rmilat-beach.jpeg',
    alt: "Aerial view of Rmilat's long unspoiled beach backed by green cliffs",
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Plage+Rmilat+Asilah+Morocco',
    cat: 'beach',
    location: {
      en: 'Plage Rmilat, Asilah',
      fr: 'Plage Rmilat, Asilah',
      ar: 'شاطئ الرميلات، أصيلة',
      es: 'Playa Rmilat, Asilah',
      nl: 'Strand Rmilat, Asilah',
      de: 'Strand Rmilat, Asilah',
      it: 'Spiaggia Rmilat, Asilah',
      pt: 'Praia Rmilat, Asilah',
    },
  },
  {
    src: '/images/attractions/asilah-beaches/Sidi-Mghayet-Beach.jpeg',
    alt: 'Rustic bamboo beach shacks lining the tranquil shores of Sidi Mghayet',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Plage+Sidi+Mghayet+Asilah+Morocco',
    cat: 'beach',
    location: {
      en: 'Plage Sidi Mghayet, Asilah',
      fr: 'Plage Sidi Mghayet, Asilah',
      ar: 'شاطئ سيدي مغيث، أصيلة',
      es: 'Playa Sidi Mghayet, Asilah',
      nl: 'Strand Sidi Mghayet, Asilah',
      de: 'Strand Sidi Mghayet, Asilah',
      it: 'Spiaggia Sidi Mghayet, Asilah',
      pt: 'Praia Sidi Mghayet, Asilah',
    },
  },
  {
    src: '/images/attractions/asilah-beaches/Camel-tour.jpeg',
    alt: 'Colorfully saddled camels resting before a beach ride along the Atlantic shore',
    mapUrl: "https://www.google.com/maps/search/?api=1&query=camel+tours+Asilah+beach+Morocco",
    cat: 'beach',
    location: {
      en: 'Asilah Beach Camel Tours',
      fr: "Balades à Dos de Chameau, Plage d'Asilah",
      ar: 'جولات الإبل، شاطئ أصيلة',
      es: 'Tours en Camello, Playa de Asilah',
      nl: 'Kameelritten, Strand van Asilah',
      de: 'Kameltouren, Strand von Asilah',
      it: 'Tour in Cammello, Spiaggia di Asilah',
      pt: 'Passeios de Camelo, Praia de Asilah',
    },
  },
]

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null)
  const lang = useUserLanguage()
  const t = useT()

  const getLocation = img => img.location[lang] || img.location.en

  return (
    <section id="gallery" className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className="eyebrow mb-3">{t('gallery.eyebrow')}</p>
        <h2 className="font-cormorant text-[2.8rem] text-deep-blue section-underline">{t('gallery.title')}</h2>
      </div>

      <Tabs.Root defaultValue="all">
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
              {t(cat.key)}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="all">
          <PhotoGrid images={IMAGES} onOpen={setLightbox} getLocation={getLocation} />
        </Tabs.Content>

        {CATEGORIES.slice(1).map(cat => (
          <Tabs.Content key={cat.value} value={cat.value}>
            <PhotoGrid
              images={IMAGES.filter(i => i.cat === cat.value)}
              onOpen={setLightbox}
              getLocation={getLocation}
            />
          </Tabs.Content>
        ))}
      </Tabs.Root>

      {/* Lightbox */}
      <Dialog.Root open={!!lightbox} onOpenChange={open => !open && setLightbox(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/95 z-[2000] animate-[fadeIn_0.2s_ease]" />
          <Dialog.Content
            className="fixed inset-0 z-[2001] flex flex-col items-center justify-center p-4 outline-none"
            onKeyDown={e => {
              if (!lightbox) return
              const idx = IMAGES.findIndex(i => i.src === lightbox.src)
              if (e.key === 'ArrowRight') setLightbox(IMAGES[(idx + 1) % IMAGES.length])
              if (e.key === 'ArrowLeft') setLightbox(IMAGES[(idx - 1 + IMAGES.length) % IMAGES.length])
            }}
          >
            <Dialog.Title className="sr-only">{lightbox?.alt}</Dialog.Title>
            {lightbox && (
              <>
                <img
                  src={lightbox.src}
                  alt={lightbox.alt}
                  className="max-w-[92vw] max-h-[80vh] object-contain rounded-md shadow-2xl"
                />
                <div className="mt-4 text-center">
                  <p className="text-white font-semibold text-base">{lightbox.alt}</p>
                  <a
                    href={lightbox.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-white/60 text-sm mt-1.5 hover:text-terracotta transition-colors group"
                  >
                    <MapPin size={13} className="text-terracotta shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="underline underline-offset-2 decoration-white/30 group-hover:decoration-terracotta">
                      {getLocation(lightbox)}
                    </span>
                  </a>
                </div>
              </>
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

function PhotoGrid({ images, onOpen, getLocation }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {images.map(img => (
        <button
          key={img.src}
          onClick={() => onOpen(img)}
          className="aspect-square rounded-xl overflow-hidden cursor-zoom-in group outline-none focus-visible:ring-2 focus-visible:ring-terracotta relative"
        >
          <img
            src={img.src}
            alt={img.alt}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-left">
            <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{img.alt}</p>
            <span className="flex items-center gap-1 text-white/70 text-[0.65rem] mt-0.5">
              <MapPin size={10} className="text-terracotta shrink-0" />
              {getLocation(img)}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
