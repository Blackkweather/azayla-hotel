import { useState } from 'react'
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })

    if (authErr) {
      setError('Invalid credentials. Please try again.')
      setLoading(false)
      return
    }

    // Verify admin role is in app_metadata (server-controlled, not user-editable)
    if (data.session?.user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Access denied. This portal is for authorised staff only.')
      setLoading(false)
    }
    // On success, onAuthStateChange in AdminPage will re-render the dashboard
  }

  return (
    <div className="min-h-screen bg-deep-blue flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-10">
          <img
            src="/logo-removebg-preview.png"
            alt="Azayla Hotel"
            className="h-24 w-auto mx-auto brightness-0 invert mb-5"
          />
          <div className="inline-flex items-center gap-2 text-white/40 text-[0.65rem] uppercase tracking-[3px] border border-white/10 rounded-full px-4 py-1.5">
            <Lock size={11} />
            <span>Staff Portal</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-deep-blue to-[#1e4d66] px-8 py-5">
            <h1 className="font-cormorant text-2xl font-semibold text-white">Sign In</h1>
            <p className="text-white/50 text-xs mt-0.5">Admin access only</p>
          </div>

          <div className="px-8 py-7">
            {error && (
              <div className="flex items-start gap-2.5 mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-deep-blue/70 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors"
                  placeholder="admin@azayla.hotel"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-deep-blue/70 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-terracotta transition-colors pr-11"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-terracotta hover:bg-terracotta/90 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm mt-1"
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </span>
                  : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-white/30 hover:text-white/60 text-xs transition-colors">
            ← Back to hotel website
          </a>
        </p>
      </div>
    </div>
  )
}
