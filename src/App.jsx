import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import About from './components/About'
import Rooms from './components/Rooms'
import Gallery from './components/Gallery'
import Amenities from './components/Amenities'
import Reviews from './components/Reviews'
import Location from './components/Location'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FloatingButtons from './components/FloatingButtons'

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[9999] focus:bg-terracotta focus:text-white focus:px-6 focus:py-2 focus:rounded-full"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Stats />
        <About />
        <Rooms />
        <Gallery />
        <Amenities />
        <Reviews />
        <Location />
        <Contact />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  )
}
