import { useState } from 'react'
import { Phone, Mail } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

const CONTACT_CARDS = [
  {
    icon: <Phone size={22} className="text-terracotta" />,
    bg: 'bg-terracotta/10',
    label: 'Phone',
    value: '+212 539-416717',
    href: 'tel:+212539416717',
  },
  {
    icon: <Mail size={22} className="text-deep-blue" />,
    bg: 'bg-deep-blue/8',
    label: 'Email',
    value: 'azayla.hotel@gmail.com',
    href: 'mailto:azayla.hotel@gmail.com',
  },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const subject = encodeURIComponent(`Inquiry from ${form.name}`)
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`)
    window.location.href = `mailto:azayla.hotel@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <section id="contact" className="py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-14 section-underline">
        <h2 className="font-cormorant text-[2.8rem] text-deep-blue">Contact Us</h2>
      </div>

      {/* Contact cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-12 max-w-md mx-auto">
        {CONTACT_CARDS.map(c => (
          <a
            key={c.label}
            href={c.href}
            target={c.external ? '_blank' : undefined}
            rel={c.external ? 'noopener noreferrer' : undefined}
            className="block no-underline"
          >
            <Card className="p-5 text-center hover:-translate-y-1 hover:border-terracotta transition-all duration-300 cursor-pointer">
              <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center mx-auto mb-3`}>
                {c.icon}
              </div>
              <div className="text-[0.7rem] uppercase tracking-widest text-gray-400 mb-1">{c.label}</div>
              <div className="font-semibold text-deep-blue text-sm">{c.value}</div>
            </Card>
          </a>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-deep-blue mb-1.5">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-nunito focus:outline-none focus:border-terracotta transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-deep-blue mb-1.5">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-nunito focus:outline-none focus:border-terracotta transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-deep-blue mb-1.5">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-nunito focus:outline-none focus:border-terracotta transition-colors resize-none"
                placeholder="How can we help you?"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" size="lg">
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
